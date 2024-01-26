# Mines on Twitch

A Minesweeper-like game that reads Twitch chat for moves and gives points.

For streamers, add <span>https://mines-on-twitch.vercel.app/?channel=*YourChannelName*</span> as a browser source in your streaming application. Recommended size is 1920x1080 and downsize to fit your layout.

Chatters send commands in Twitch chat using the following format (Letters are not case-sensitive):
A3 : Open tile A3
B6f : Flag tile B6

Just like in Minesweeper, the number on a tile indicates how many of the surrounding tiles (including diagonals) are mines. Gain points by opening safe tiles and flagging mines, and lose points if you open a mine or flag a safe tile. Unlike other versions of Minesweeper, mistakenly flagging a safe tile will immediately open it.

Note that the game is not synchronized across instances, so the only meaningful way to play is for the streamer to load in the game as a browser source or share their screen to play. Giving the URL to people in chat will not show them the same game as the streamer. Naturally, chatters with more latency will have a harder time playing, and the streamer (with no latency) will have an inherit advantage.

You can also play the game without connecting to Twitch by clicking "Play without Connecting". This version allows clicking tiles to open them and right-clicking tiles to flag them, or you can use the built in chatbox as well.

## Credits

Sound Effects:

[Whoosh](https://freesound.org/people/DJT4NN3R/sounds/449992/)

[Point change](https://freesound.org/people/plasterbrain/sounds/608431/)
