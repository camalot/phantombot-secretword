(function () {
	"use strict";
	var bots = $.readFile("./addons/ignorebots.txt");
	var MODULE_FILE = "./secretword/secretWordSystem.js";
	var DB_SECTION = "secretword";
	var payoutPoints = $.getSetIniDbNumber(DB_SECTION, "payoutPoints", 5000);
	var alertHookCommand = $.getSetIniDbString(DB_SECTION, "audioHookCommand", "");
	var wordlist = $.arrayShuffle($.readFile("./addons/secretwords.txt"));

	$.bind("twitchOnline", function (event) {
		if ($.bot.isModuleEnabled(MODULE_FILE)) {
			getNewRandomWord();
		}
	});

	$.bind("twitchOffline", function (event) {
		if ($.bot.isModuleEnabled(MODULE_FILE)) {
			// reveal will reveal and then clear
			revealSecretWord();
		}
	});

	$.bind("ircChannelMessage", function (event) {
		// user that sent the message
		var sender = event.getSender();
		var message = event.getMessage().toLowerCase();
		if (!$.isBot(sender) && !$.isOwner(sender) && !isTwitchBot(sender)) {
			checkMessageForSecretWord(sender, message);
		}
	});

	$.bind("command", function (event) {
		var sender = event.getSender();
		var command = event.getCommand();
		var args = event.getArgs();
		var action = args[0];
		var subaction = args[1];

		if (command.equalsIgnoreCase("secret")) {
			// set the random word for the current stream.
			if (action == "create") {
				getNewRandomWord();
			} else if (action == "points") {
				parsedPoints = parseInt(subaction);
				if (subaction == "" || isNaN(parsedPoints)) {
					payoutPoints = $.getIniDbNumber(DB_SECTION, "payoutPoints");
				} else {
					$.consoleLn("set the payout point value to " + parsedPoints);
					$.setIniDbNumber(DB_SECTION, "payoutPoints", parsedPoints);
					payoutPoints = parsedPoints;
				}

				$.say($.lang.get('secretword.secret.payout', $.whisperPrefix(sender), $.getPointsString(payoutPoints)));
			} else if ( action == "audio" ) {
				if (subaction == "" || subaction == null) {
					alertHookCommand = $.getIniDbString(DB_SECTION, "audioHookCommand");
				} else {
					var newHook = subaction;
					if ($.inidb.exists("audioCommands", newHook)) {
						$.consoleLn("set the alert clip value to " + newHook);
						$.setIniDbString(DB_SECTION, "audioHookCommand", newHook);
						alertHookCommand = newHook;
					}
				}
				$.say($.lang.get('secretword.secret.audio.current', $.whisperPrefix(sender), alertHookCommand));
			} else if ( action == "reveal" ) {
				revealSecretWord();
				getNewRandomWord();
			} else {
				printUsage(sender);
			}
		}
	});

	$.bind("initReady", function () {
		if ($.bot.isModuleEnabled(MODULE_FILE)) {
			$.consoleLn("initialize secret word command");
			$.registerChatCommand(MODULE_FILE, "secret", 2);
		}
	});

	function revealSecretWord() {
		var secret = $.getIniDbString(DB_SECTION, "word");
		$.say($.lang.get("secretword.secret.reveal", secret));
		clearWord();
	}

	function printUsage(sender) {
		$.say($.lang.get("secretword.secret.usage", $.whisperPrefix(sender)));
	}

	function checkMessageForSecretWord(sender, message) {
		var cleanMessage = (message + "").toLowerCase().trim().replace(/[\!\.\,;\?"'\$`_\-\/\\\[\]=\+\*~&\(\)\^%\#@><\|:]/gi, " ");
		var messageWords = cleanMessage.split(" ");
		var secret = $.getIniDbString(DB_SECTION, "word");
		$.consoleLn("looking for '" + secret + "'");
		if (secret != "" && isInArray(messageWords, secret)) {
			$.consoleLn("we found something from " + sender + " that matches");
			// do the stuff (announce / reward / etc)
			if (alertHookCommand != "" && $.inidb.exists("audioCommands", alertHookCommand)) {
				$.panelsocketserver.triggerAudioPanel($.inidb.get("audioCommands", alertHookCommand));
			}
			clearWord();
			$.inidb.incr("points", sender.toLowerCase(), payoutPoints);
			$.say($.lang.get("secretword.secret.discovered", $.whisperPrefix(sender), $.getPointsString(payoutPoints), secret));
			getNewRandomWord();
		}
	}

	function getNewRandomWord() {
		clearWord();
		var newWord = $
			.randElement(wordlist)
			.trim()
			.toLowerCase();
		$.setIniDbString(DB_SECTION, "word", newWord);
		$.consoleLn("[[I have secretly created a new random word: " + newWord + "]]");
	}

	function clearWord() {
		$.setIniDbString(DB_SECTION, "word", "");
		$.consoleLn("I have cleared the secret word.");
	}

	function isInArray(array, testObject) {
		for (var i = 0; i < array.length; ++i) {
			if (array[i] == testObject) {
				$.consoleLn("matched: " + testObject);
				return true;
			}
		}
		return false;
	}

	function isTwitchBot(username) {
		var i;
		for (i in bots) {
			if (bots[i].equalsIgnoreCase(username)) {
				return true;
			}
		}
		return false;
	}
})();
