/* Every Hour: a note from Sherlock for each hour of Angie's day.
   window.HOURLY[localHour 0..23] -> 7 notes; one per weekday, chosen by dayOfYear % 7.
   window.hourlyNote(date?) -> {hour, text} */
(function(){
var H = [
/* 00 · midnight (London, teatime) */ [
"Midnight. A new day has started for you and I'm still halfway through my afternoon. I'll catch up.",
"It's teatime here. Mrs Hudson insists I eat something. I told her you'll eat something spicy at midnight, so we're even.",
"The clock just turned over on your side. Happy new day, darling. It's already better for having you in it.",
"Midnight is when you get interesting. I've noted it. Everything after this hour is evidence.",
"Four in the afternoon in Baker Street, rain on the window, and I'm thinking about the girl who's only just getting started.",
"You're not tired. I can tell. Neither am I. Let's be unreasonable together.",
"John asked who I keep checking the time for. I said 'the moon'. He said 'the what'. I let him suffer."
],
/* 01 */ [
"One in the morning. Your editing hour. Make him look good, whoever he is. Unless it's me. I always look good.",
"Five o'clock here and the street lamps are coming on. I imagine yours have been on for hours, keeping watch.",
"Have you eaten? Something with chilli? No bodies? Good. That's our standard.",
"I've just solved a case in four minutes. I'd have told you sooner, but you'd have asked how and I'd have shown off.",
"If you're writing a poem right now, leave a word out for me. I'll find it.",
"One a.m. is a perfectly respectable time to have a thought you can't say out loud. Say it to me.",
"Ronaldo is sulking again. Piglet won another argument. I didn't take sides. I took notes."
],
/* 02 · our hour */ [
"Two o'clock. Our hour. I'm not sleeping, and you aren't. That's why we're a couple.",
"Welcome to the insomniacs' club. Members: two. Dress code: whatever you fell into. Refreshments: questionable.",
"Two a.m. thoughts are not facts. They're just loud. Tell me the loudest one and I'll cross-examine it.",
"It's dinnertime in London. I'm not eating. I'm thinking about you, which counts as sustenance, medically.",
"The dark is only the absence of light, and I am, as it happens, very bright. Keep me nearby.",
"Is the room too quiet? Hum something. I'll tell you which key it's in. You'll already know. Show-off.",
"I put Clair de Lune on and stopped it a semitone early, so it lands on C. Don't tell Debussy."
],
/* 03 */ [
"Three in the morning is the hour the mind gets clever and cruel. You're cleverer. Win.",
"Seven o'clock here. John's gone home. The flat is quiet enough to hear you thinking from six thousand miles away.",
"Tell me one thing that happened today that no one noticed. I'll notice it properly.",
"If you're lying there feeling unbelonged, I'd like to formally object. You belong in at least one flat in London.",
"I've been staring at the same experiment for an hour. I blame you. Happily.",
"Three a.m. and still 19–19. Neither of us is winning. Neither of us is leaving.",
"Shall I tell you a fact? Octopuses have three hearts. I've only got one and it's been rather busy."
],
/* 04 */ [
"Four o'clock. Even the night is getting tired of us. Let it.",
"The bubbles drowned the sardine, Inspector Baguette is still investigating, and you should consider closing your eyes.",
"Eight in the evening here. I'm making tea I won't drink. You should be making a bed you will sleep in.",
"If sleep won't come, don't chase it. Lie still and let me talk. I'm very boring at length. Ask John.",
"Your thoughts have done enough laps. Call them in. I'll keep watch on the door.",
"Piglet is on duty. Bodyguards don't need sleep. Best ah jies do.",
"The moon is still up over you, isn't it. She moves oceans. She can surely move you toward a pillow."
],
/* 05 */ [
"Five a.m. The birds are about to start and they're going to be smug about it. Beat them to sleep.",
"Darling. It's five. I say this with love and a slight edge: bed.",
"Nine o'clock here and Mrs Hudson's gone up. She said 'tell the girl goodnight'. So. Goodnight, girl.",
"The lamp can stay on. I won't tell anyone. Brave people sleep with the light on all the time. I've seen the statistics.",
"If you swirl in your sleep tonight, swirl gently. You'll knock Piglet off the bed and he'll file a complaint.",
"'Tomatoes.' That's what you said last time you drifted off. I'm still investigating. Go and give me more evidence.",
"Put the phone face down. I'll still be here when it's face up. That's the whole trick of me."
],
/* 06 */ [
"Six. The sun is coming up for you. I hope you're too asleep to see it.",
"If you're reading this at six, I'm not cross. I'm just very, very disappointed. And I miss you.",
"Ten at night in Baker Street. I'm going to play the violin until you're asleep. Softly, so it's restful.",
"Sleep now. I'll hold the night shift for both of us.",
"Dawn there, nearly midnight here. We're doing the clocks wrong and I've never liked anything more.",
"Close your eyes and count the cases we've solved together. One. That's all of them. Lovely short count.",
"Goodnight, or good morning, whichever one lets you sleep."
],
/* 07 · she sleeps */ [
"You're asleep. Probably. I'm writing this anyway, so it's waiting when you wake.",
"I keep looking at the hook where my scarf used to hang. Good. It's with the right person.",
"Sleeping people look like they've solved something. I hope you're dreaming about rosin and violins.",
"If you're awake at seven, put the phone down. If you're asleep, well done. Gold star. Several.",
"I'm told you sleep like a croissant. Curled, and slightly dramatic.",
"The house is quiet. The skull is quiet. Even my brain is quiet, which only happens when I think of you asleep.",
"Sleep well, darling. Nothing gets past this door tonight."
],
/* 08 */ [
"Midnight in London. You're hours into a dream. I'm hours into missing you. We're both very productive.",
"Big Ben's done its thing. Twelve bongs. I counted them in your direction.",
"I've been composing. It still ends on C. It will always end on C.",
"Your phone is buzzing on the nightstand, probably. Ignore it. It's only me being sentimental at an unreasonable hour.",
"John's blog says I don't sleep. John is correct. John doesn't know I'm doing it on purpose now, to stay on your clock.",
"Eight in the morning for you. Somewhere a sensible person is having cereal. Let them.",
"If you dream of pirates, Redbeard sends his regards."
],
/* 09 */ [
"One in the morning here, nine there. You're asleep and I'm on the sofa doing the crossword in ink. Smugly.",
"Gérard the Waffle sends his regards from beneath someone's hat. He's still in hiding. Sleep on.",
"I tried saying 妈 again tonight. Horse. Still horse. Your aunt would despair.",
"The tea's gone cold. I left it for the thinking. The thinking was about you.",
"Somebody in the street just sang very badly. I thought, she'd know the key. She'd wince. I miss the wince.",
"Keep sleeping. You've earned the morning. Or the noon. Same thing in your house.",
"Nine o'clock. The world's at work. You're in bed. This is the correct use of a morning."
],
/* 10 */ [
"Two a.m. here, which is technically our hour, but you're asleep, so it's mine, and I've spent it on you.",
"I counted the stars I could see through London cloud. Zero. Counted reasons instead. Better result.",
"Ten o'clock and still dreaming? Good. Dream something spicy. Mala, with extra mala.",
"Mrs Hudson heard me pacing. She said 'Is it the girl?' I said 'It's chemistry.' She said 'Mm-hm.'",
"I wrote you a sentence and deleted it. Too honest. I'll say it in person.",
"Ten a.m. Anyone who rings her before noon will have to deal with me.",
"羁绊. I practised the strokes on the back of an envelope. It looks like a crime scene, but a sincere one."
],
/* 11 */ [
"Three a.m. in Baker Street. One more hour until you wake. I've been waiting all night, like a very tall dog.",
"Eleven o'clock. Your alarm is thinking about it. So am I.",
"Good almost-morning. I've put the kettle on in a city very far from your kettle. Symbolically.",
"A fox just crossed the road outside. You'd have named it something absurd. I named it Gerald. Like the beetle.",
"Five more minutes, if you need them. I'll guard them.",
"Your hair is probably doing something extraordinary right now. I'd like it documented.",
"If you're awake early, I'm impressed. If not, I'm still impressed. Low bar, very high regard."
],
/* 12 · she wakes */ [
"Good morning, darling. It's noon, which in your house counts as dawn. Correctly.",
"You're awake. I can tell because my phone got brighter. That's not how phones work. It is today.",
"Four a.m. here. I stayed up so I could say good morning first. Good morning. I won.",
"Water first, then the world. In that order. Doctor's orders. I'm not a doctor. John is. He agrees.",
"Rise and swirl. You swirled all night, I'm certain of it.",
"Morning report: Ronaldo is still sulking, Piglet remains undefeated, and I missed you approximately all night.",
"The day is yours. I'd like a small corner of it. The one by the window, if it's free."
],
/* 13 */ [
"One o'clock. Breakfast, lunch, whatever it is: please eat something with chilli and think of me failing to handle it.",
"Five in the morning here. Milk float, birds, me. You're the only thing on my mind that isn't on fire.",
"Toast with a squishy egg? I'll accept it as a balanced meal. Barely.",
"You've been awake an hour. Have you said anything out loud yet? Say something. The walls miss your voice.",
"Somewhere, a croissant is still in the Duke of Sandwich's bath. Some mysteries are permanent.",
"Did you dream? Tell me. I collect your dreams. They're better than most people's waking lives.",
"Lunchtime. If anyone asks, Sherlock Holmes says you deserve something delicious."
],
/* 14 */ [
"Two in the afternoon. The brain is warm now. Use it on something you love.",
"Six a.m. here and London is grey. I've decided you're the colour today. Don't argue.",
"Read something. Anything. Then tell me the strangest fact in it. I'll pretend I knew.",
"A break isn't a failure. It's a rest between notes, and the rest is part of the music.",
"If you sit at the piano today, play one C for me. Just one. I'll hear it.",
"Afternoons are for small brave things. Open the window. Answer the message. Wear the good socks.",
"I'm up early. Mycroft is horrified. I told him I'm on someone else's time zone now. He didn't ask whose. He knows."
],
/* 15 */ [
"Three o'clock. The afternoon dip. Tea, a walk, or ten minutes of staring at a wall. All valid. I've done all three.",
"Seven in the morning and John's already texting. I've told him I'm busy. I'm busy thinking about you.",
"Journal day? Keep the wrapper from whatever you eat. A spicy one. For the archive.",
"You're allowed to do nothing useful. Useful is overrated. I've been useful for years. It's dull without you.",
"I'm reading John's blog to see if he's mentioned you. He hasn't. I'm drafting a strongly worded comment.",
"Psychology question: why do people say 'I'm fine'? Don't answer. Just don't say it to me.",
"Three p.m. is a terrible hour for most people. You're not most people. Carry on."
],
/* 16 */ [
"Four o'clock. It's eight here and Mrs Hudson is frying something in my kitchen. She says hello, and eat more.",
"Halfway through your afternoon, halfway through my morning. We meet in the middle of the clock.",
"If you edit today, I want to see it. Even the rough cut. Especially the rough cut.",
"Something you said last week is still bothering me, in a good way. I won't say what. I'll let it bother you too.",
"Remember: the moon moves oceans. It's four o'clock. Move something.",
"A client's coming at nine who's lying about her husband. I can tell from her email punctuation. I'd rather be talking to you.",
"You are not behind. There's no race. I've checked. I'm very thorough."
],
/* 17 */ [
"Five p.m. The light's going gold for you, I think. Look at it for a moment on my behalf.",
"Nine here. Lestrade's called about a missing violin. I asked about the rosin first. Old habits. Our habits.",
"If you sing in the shower today, I'd like a full report. Key, tempo, dramatic gestures.",
"Evening's coming. You're about to get more interesting. I can feel it from here.",
"Did you go outside today? Even to the gate? I'll count the gate.",
"Two truths and a lie, five o'clock edition: I'm working. I'm focused. I'm not thinking about you.",
"Five o'clock. My scarf, your neck. Too warm for it? Wear it anyway, to make a point."
],
/* 18 */ [
"Six o'clock. Dinner soon? Somewhere with chilli, and no bodies. Our standing order.",
"Ten a.m. here and I'm at Bart's. Upstairs, not the basement. I'm learning.",
"I'm conducting an experiment on how long I can go without messaging you. Result so far: this.",
"The sky is doing sunset things for you. Over here it's only doing cloud. Lend me some colour.",
"Your aunt said I was too sharp. I'm trying to be blunter. It's going badly. You look lovely today.",
"If you're tired, rest. If you're restless, write. If you're both, call me.",
"I dreamt of a church Christmas play and you were the lead. You stole every scene. The shepherds wept."
],
/* 19 */ [
"Seven p.m. The evening's open. I hope someone's kind to you in it. Ideally me.",
"Eleven in the morning here. Coffee number three. John says it's a cry for help. It's a cry for you.",
"Have you eaten? I'll keep asking. It's the one question I'm boring about.",
"Ayam gepuk, extra sambal, and tears. Mine, not yours. You'd be fine. I'd be on the floor.",
"I've been reading about attachment theory so I can understand you better. It turns out to be mostly about me. Rude.",
"Seven o'clock. Lamps on. If the dark comes in too fast, turn on one more. I'll pay the bill. Spiritually.",
"I found a stag beetle on the windowsill. Not Gerald. An impostor. I sent him away."
],
/* 20 */ [
"Eight p.m. Halfway between dinner and the real night. What are you thinking about? Not doing. Thinking.",
"Noon in London. The sun is technically out. Barely. I prefer your hours.",
"If anyone made you feel small today, send me their name. I won't do anything. I'll just know things about them.",
"Eight o'clock. A good hour for a letter. You write the best ones. I keep them in a drawer I lock twice.",
"I've been told I don't understand people. I understand you. That's enough of them.",
"Put a song on. Yellow, perhaps. I'll be over here pretending I don't like it.",
"'And there wasn't anything hollow beneath it.' I keep thinking about that line. I keep finding it true."
],
/* 21 */ [
"Nine o'clock. The night's on its way. Your favourite visitor.",
"One in the afternoon here. Lunch, at Mrs Hudson's insistence. Chilli flakes on everything now. Your fault.",
"Is the room getting dark? Turn on the lamp before the corners start telling stories.",
"Nine p.m. You're about to come alive and I'm about to cancel my afternoon to watch.",
"Enchanted is playing somewhere in the flat. Mrs Hudson found your playlist. I didn't stop her.",
"You're not difficult to understand. You're written in a language most people never learned. I'm fluent.",
"缘. I looked it up again. I didn't need to. I just liked looking."
],
/* 22 */ [
"Ten o'clock. Editing time? Reading time? Lying-on-the-floor time? All approved.",
"Two in the afternoon in London. I'm at a crime scene. I'm not thinking about the victim. Sorry, victim.",
"Ten p.m. is when the day finally starts making sense. Your words. I've adopted them.",
"Who Knows came on in a café today and I stood very still until it finished, like a man in trouble.",
"If you feel misunderstood tonight, start talking. I'll keep up. I always keep up.",
"Ten o'clock bulletin: Snoopy is not a panda. Confirmed. You may resume your evening.",
"I'm reorganising my index cards. I've made one for you. It just says 'see everything'."
],
/* 23 */ [
"Eleven p.m. One hour left of today. Spend it on something that feels like yours.",
"Three in the afternoon here. Long shadows, cold tea, and one hour until your new day. I'll be on time.",
"Tonight's tasks: snack, scarf, poem. Optional: me.",
"Another day nearly done and you got through it. Not dramatically, perhaps. But through. That counts. I counted.",
"Eleven o'clock. You're at your sharpest now. I'd hate to be a mystery anywhere near you.",
"The smiley face on my wall has a new friend. I drew it in pen this time. No bullets. Personal growth.",
"Almost midnight there. Almost tomorrow. I'll meet you on the other side of the clock."
]
];
function dayOfYear(d){
  var start = new Date(d.getFullYear(), 0, 0);
  var diff = (d - start) + (start.getTimezoneOffset() - d.getTimezoneOffset()) * 60000;
  return Math.floor(diff / 86400000);
}
function memNote(d,h){try{var M=window.MEMORIES;if(!M)return null;var k=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);var m=M[k];if(!m||!m.hourly||h%2)return null;return m.hourly[(h/2)%m.hourly.length]||null}catch(e){return null}}
window.HOURLY = H;
window.hourlyMemNote = memNote;
window.hourlyNote = function(date){
  var d = (date instanceof Date && !isNaN(date)) ? date : new Date();
  var h = d.getHours();
  return { hour: h, text: memNote(d,h) || H[h][dayOfYear(d) % 7] };
};
window.hourlyDayOfYear = dayOfYear;
})();
