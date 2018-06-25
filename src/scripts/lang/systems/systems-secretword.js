$.lang.register(
	"secretword.secret.usage",
	"$1 !secrets usage: !secrets <command> <arguments>. Commands: create - creates a new secret word. " +
		":: points [value] - gets/sets the reward points. " +
		":: audio - gets/sets the audio command to play. " +
		":: reveal - reveals the secret word and sets a new word."
);
$.lang.register(
	"secretword.secret.payout",
	"$1 The current reward for discovering the secret word is $2"
);
$.lang.register(
	"secretword.secret.audio.current",
	"$1  The current alert clip is: $2"
);
$.lang.register(
	"secretword.secret.discovered",
	"$1 I have added $2 for finding the secret word '$3'. A new word has been chosen."
);
$.lan.register("secretword.secret.reveal", "The secret word was '$1'.");
