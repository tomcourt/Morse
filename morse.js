// TODO FEATURES
// Auto advance UI checkbox control
// Timer defered adding wrong to Statistic and results
// Local storage, reset button w. confirmation for each section
// Handle the odd number of prosigns
// Speed dither and tone dither (never allow charWPM to exceed wordWPM)
// Implement improvement lessions (accuracy, speed, least heard)
// Words lesson not handling spaces
// Implement QSOs
// Animate updated of graphs
// Option to allow 



let audioCtx = null;

// '=' aka BT prosign (break)
// '+' aka AR prosign (end message)
// '\' shoehorned symbol for SK prosign (end contact)
let kochMethodOrder = "KMRSUAPTLOWI.NJEF0Y,VG5/Q9ZH38B?427C1D6X=\\+";
let allSymbols      = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,?/=+\\"
let enabledSymbols  = allSymbols; 

let runTimer;
let timeoutTimer;
let responseTimeoutMs = 0;
let lastCharSent = "";
let remainingLessonChars = "";
let correctInRow = 0;
let correctChars = 0;
let wrongChars = 0;
let lessonCharsLength = 0;
let isCharLesson = false;
let isNewSession = true;

// basic english dictionary (850 words)
let words = "COME GET GIVE GO KEEP LET MAKE PUT SEEM TAKE BE DO HAVE SAY SEE SEND MAY WILL ABOUT ACROSS AFTER\
AGAINST AMONG AT BEFORE BETWEEN BY DOWN FROM IN OFF ON OVER THROUGH TO UNDER UP WITH AS FOR OF TILL THAN A THE\
ALL ANY EVERY NO OTHER SOME SUCH THAT THIS I HE YOU WHO AND BECAUSE BUT OR IF THOUGH WHILE HOW WHEN WHERE WHY\
AGAIN EVER FAR FORWARD HERE NEAR NOW OUT STILL THEN THERE TOGETHER WELL ALMOST ENOUGH EVEN LITTLE MUCH NOT ONLY\
QUITE SO VERY TOMORROW YESTERDAY NORTH SOUTH EAST WEST PLEASE YES ACCOUNT ACT ADDITION ADJUSTMENT ADVERTISEMENT\
AGREEMENT AIR AMOUNT AMUSEMENT ANIMAL ANSWER APPARATUS APPROVAL ARGUMENT ART ATTACK ATTEMPT ATTENTION ATTRACTION\
AUTHORITY BACK BALANCE BASE BEHAVIOUR BELIEF BIRTH BIT BITE BLOOD BLOW BODY BRASS BREAD BREATH BROTHER BUILDING\
BURN BURST BUSINESS BUTTER CANVAS CARE CAUSE CHALK CHANCE CHANGE CLOTH COAL COLOUR COMFORT COMMITTEE COMPANY\
COMPARISON COMPETITION CONDITION CONNECTION CONTROL COOK COPPER COPY CORK COTTON COUGH COUNTRY COVER CRACK CREDIT\
CRIME CRUSH CRY CURRENT CURVE DAMAGE DANGER DAUGHTER DAY DEATH DEBT DECISION DEGREE DESIGN DESIRE DESTRUCTION\
DETAIL DEVELOPMENT DIGESTION DIRECTION DISCOVERY DISCUSSION DISEASE DISGUST DISTANCE DISTRIBUTION DIVISION DOUBT\
DRINK DRIVING DUST EARTH EDGE EDUCATION EFFECT END ERROR EVENT EXAMPLE EXCHANGE EXISTENCE EXPANSION EXPERIENCE\
EXPERT FACT FALL FAMILY FATHER FEAR FEELING FICTION FIELD FIGHT FIRE FLAME FLIGHT FLOWER FOLD FOOD FORCE FORM\
FRIEND FRONT FRUIT GLASS GOLD GOVERNMENT GRAIN GRASS GRIP GROUP GROWTH GUIDE HARBOUR HARMONY HATE HEARING HEAT\
HELP HISTORY HOLE HOPE HOUR HUMOUR ICE IDEA IMPULSE INCREASE INDUSTRY INK INSECT INSTRUMENT INSURANCE INTEREST\
INVENTION IRON JELLY JOIN JOURNEY JUDGE JUMP KICK KISS KNOWLEDGE LAND LANGUAGE LAUGH LAW LEAD LEARNING LEATHER\
LETTER LEVEL LIFT LIGHT LIMIT LINEN LIQUID LIST LOOK LOSS LOVE MACHINE MAN MANAGER MARK MARKET MASS MEAL MEASURE\
MEAT MEETING MEMORY METAL MIDDLE MILK MIND MINE MINUTE MIST MONEY MONTH MORNING MOTHER MOTION MOUNTAIN MOVE MUSIC\
NAME NATION NEED NEWS NIGHT NOISE NOTE NUMBER OBSERVATION OFFER OIL OPERATION OPINION ORDER ORGANIZATION ORNAMENT\
OWNER PAGE PAIN PAINT PAPER PART PASTE PAYMENT PEACE PERSON PLACE PLANT PLAY PLEASURE POINT POISON POLISH PORTER\
POSITION POWDER POWER PRICE PRINT PROCESS PRODUCE PROFIT PROPERTY PROSE PROTEST PULL PUNISHMENT PURPOSE PUSH\
QUALITY QUESTION RAIN RANGE RATE RAY REACTION READING REASON RECORD REGRET RELATION RELIGION REPRESENTATIVE\
REQUEST RESPECT REST REWARD RHYTHM RICE RIVER ROAD ROLL ROOM RUB RULE RUN SALT SAND SCALE SCIENCE SEA SEAT\
SECRETARY SELECTION SELF SENSE SERVANT SEX SHADE SHAKE SHAME SHOCK SIDE SIGN SILK SILVER SISTER SIZE SKY SLEEP\
SLIP SLOPE SMASH SMELL SMILE SMOKE SNEEZE SNOW SOAP SOCIETY SON SONG SORT SOUND SOUP SPACE STAGE START STATEMENT\
STEAM STEEL STEP STITCH STONE STOP STORY STRETCH STRUCTURE SUBSTANCE SUGAR SUGGESTION SUMMER SUPPORT SURPRISE\
SWIM SYSTEM TALK TASTE TAX TEACHING TENDENCY TEST THEORY THING THOUGHT THUNDER TIME TIN TOP TOUCH TRADE TRANSPORT\
TRICK TROUBLE TURN TWIST UNIT USE VALUE VERSE VESSEL VIEW VOICE WALK WAR WASH WASTE WATER WAVE WAX WAY WEATHER\
WEEK WEIGHT WIND WINE WINTER WOMAN WOOD WOOL WORD WORK WOUND WRITING YEAR ANGLE ANT APPLE ARCH ARM ARMY BABY BAG\
BALL BAND BASIN BASKET BATH BED BEE BELL BERRY BIRD BLADE BOARD BOAT BONE BOOK BOOT BOTTLE BOX BOY BRAIN BRAKE\
BRANCH BRICK BRIDGE BRUSH BUCKET BULB BUTTON CAKE CAMERA CARD CART CARRIAGE CAT CHAIN CHEESE CHEST CHIN CHURCH\
CIRCLE CLOCK CLOUD COAT COLLAR COMB CORD COW CUP CURTAIN CUSHION DOG DOOR DRAIN DRAWER DRESS DROP EAR EGG ENGINE\
EYE FACE FARM FEATHER FINGER FISH FLAG FLOOR FLY FOOT FORK FOWL FRAME GARDEN GIRL GLOVE GOAT GUN HAIR HAMMER HAND\
HAT HEAD HEART HOOK HORN HORSE HOSPITAL HOUSE ISLAND JEWEL KETTLE KEY KNEE KNIFE KNOT LEAF LEG LIBRARY LINE LIP\
LOCK MAP MATCH MONKEY MOON MOUTH MUSCLE NAIL NECK NEEDLE NERVE NET NOSE NUT OFFICE ORANGE OVEN PARCEL PEN PENCIL\
PICTURE PIG PIN PIPE PLANE PLATE PLOUGH POCKET POT POTATO PRISON PUMP RAIL RAT RECEIPT RING ROD ROOF ROOT SAIL\
SCHOOL SCISSORS SCREW SEED SHEEP SHELF SHIP SHIRT SHOE SKIN SKIRT SNAKE SOCK SPADE SPONGE SPOON SPRING SQUARE\
STAMP STAR STATION STEM STICK STOCKING STOMACH STORE STREET SUN TABLE TAIL THREAD THROAT THUMB TICKET TOE TONGUE\
TOOTH TOWN TRAIN TRAY TREE TROUSERS UMBRELLA WALL WATCH WHEEL WHIP WHISTLE WINDOW WING WIRE WORM ABLE ACID ANGRY\
AUTOMATIC BEAUTIFUL BLACK BOILING BRIGHT BROKEN BROWN CHEAP CHEMICAL CHIEF CLEAN CLEAR COMMON COMPLEX CONSCIOUS\
CUT DEEP DEPENDENT EARLY ELASTIC ELECTRIC EQUAL FAT FERTILE FIRST FIXED FLAT FREE FREQUENT FULL GENERAL GOOD\
GREAT GREY HANGING HAPPY HARD HEALTHY HIGH HOLLOW IMPORTANT KIND LIKE LIVING LONG MALE MARRIED MATERIAL MEDICAL\
MILITARY NATURAL NECESSARY NEW NORMAL OPEN PARALLEL PAST PHYSICAL POLITICAL POOR POSSIBLE PRESENT PRIVATE PROBABLE\
QUICK QUIET READY RED REGULAR RESPONSIBLE RIGHT ROUND SAME SECOND SEPARATE SERIOUS SHARP SMOOTH STICKY STIFF\
STRAIGHT STRONG SUDDEN SWEET TALL THICK TIGHT TIRED TRUE VIOLENT WAITING WARM WET WIDE WISE YELLOW YOUNG AWAKE\
BAD BENT BITTER BLUE CERTAIN COLD COMPLETE CRUEL DARK DEAD DEAR DELICATE DIFFERENT DIRTY DRY FALSE FEEBLE FEMALE\
FOOLISH FUTURE GREEN ILL LAST LATE LEFT LOOSE LOUD LOW MIXED NARROW OLD OPPOSITE PUBLIC ROUGH SAD SAFE SECRET\
SHORT SHUT SIMPLE SLOW SMALL SOFT SOLID SPECIAL STRANGE THIN WHITE WRONG".split(' ');

let pauseState=0, playState=1, waitingState=2, checkmarkState=3, wrongState=4; 
let state = pauseState;

let progressObject;
let progressTimer;
let progressStartTime;
let kochEnabledObject;
let lessonsObject;
let textObject;
let resultsObject;


let lesson = {
    characters:  0,
    wrong:       0,
    totalTime:   0,
    consecutive: 0    
}


function Setting() {
    this.charWPM           = 18;
    this.wordWPM           = 5;
    this.resetMs           = 1000;
    this.toneHz            = 750;
    this.kochMethodOrder   = "KMRSUAPTLOWI.NJEF0Y,VG5/Q9ZH38B?427C1D6X=\\+";
    this.advancePercent    = 95;
    this.advanceSuccessive = 20;
}

let settings = new Setting();


function Statistic(char, wrong=0, timeout=0, correct=0, time=0, conflated="") {
    this.char      = char;
    this.wrong     = Math.floor(20*Math.random());   // TODO - restore
    this.timeout   = Math.floor(20*Math.random());
    this.correct   = Math.floor(20*Math.random());
    this.time      = time;
    this.conflated = conflated;
}


let statistics = {
  'A': new Statistic('A'),
  'B': new Statistic('B'),
  'C': new Statistic('C'),
  'D': new Statistic('D'),
  'E': new Statistic('E'),
  'F': new Statistic('F'),
  'G': new Statistic('G'),
  'H': new Statistic('H'),
  'I': new Statistic('I'),
  'J': new Statistic('J'),
  'K': new Statistic('K'),
  'L': new Statistic('L'),
  'M': new Statistic('M'),
  'N': new Statistic('N'),
  'O': new Statistic('O'),
  'P': new Statistic('P'),
  'Q': new Statistic('Q'),
  'R': new Statistic('R'),
  'S': new Statistic('S'),
  'T': new Statistic('T'),
  'U': new Statistic('U'),
  'V': new Statistic('V'),
  'W': new Statistic('W'),
  'X': new Statistic('X'),
  'Y': new Statistic('Y'),
  'Z': new Statistic('Z'),
  '0': new Statistic('0'),
  '1': new Statistic('1'),
  '2': new Statistic('2'),
  '3': new Statistic('3'),
  '4': new Statistic('4'),
  '5': new Statistic('5'),
  '6': new Statistic('6'),
  '7': new Statistic('7'),
  '8': new Statistic('8'),
  '9': new Statistic('9'),
  '.': new Statistic('.'),
  ',': new Statistic(','),
  '?': new Statistic('?'),
  '/': new Statistic('/'),
  '=': new Statistic('='),  // = or BT prosign (break message)
  '+': new Statistic('+'),  // + or AR prosign (end message)
  '\\': new Statistic('\\') // SK prosign (end contact)
                            // TODO - KN prosign (over)
};


function Session(date=Date.now(), duration=0, charWPM=18, wordWPM=5, speed=0, finalEnabled=2, finalLesson=1, wrong=0, correct=0)  {
    this.date          = date;
    this.duration      = duration;
    this.charWPM       = charWPM;
    this.wordWPM       = wordWPM;
    this.speed         = speed;
    this.finalEnabled  = finalEnabled;
    this.finalLesson   = finalLesson;
    this.wrong         = wrong;
    this.correct       = correct;
}

let sessions = []; 


const morse = {
  'A': '.-',
  'B': '-...',
  'C': '-.-.',
  'D': '-..',
  'E': '.',
  'F': '..-.',
  'G': '--.',
  'H': '....',
  'I': '..',
  'J': '.---',
  'K': '-.-',
  'L': '.-..',
  'M': '--',
  'N': '-.',
  'O': '---',
  'P': '.--.',
  'Q': '--.-',
  'R': '.-.',
  'S': '...',
  'T': '-',
  'U': '..-',
  'V': '...-',
  'W': '.--',
  'X': '-..-',
  'Y': '-.--',
  'Z': '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  '/': '-..-.',
  '=': '-...-.',    // = or BT prosign (break message/paragraph)
  '+': '.-.-.',     // + or AR prosign (end message)
  '\\': '...-.-',   // SK prosign (end contact)
                    // KN prosign (over)
  ' ': '/',         // Representing a space between words
};


function openTab(evt, tabName) {
    // Hide all tab content
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }

    // Remove active class from all buttons
    const tabButtons = document.getElementsByClassName("tab-button");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    // Show the selected tab content and add active class to the clicked button
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}


// Initialize AudioContext after user interaction
function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume AudioContext if suspended
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            console.log('AudioContext resumed');
        });
    }
    return audioCtx;
}


// Also updates the status UI element
function setState(newState, symbol="", color="black") {
    const pauseStatus     = "&#x23F8";
    const playStatus      = "&#x23F5";
    const waitingStatus   = "&#x23F1";
    const checkmarkStatus = "&#x2713";
    const statusStyle     = "padding: 10px; border: 2px solid;";
    const statusObject = document.getElementById('status');

    state = newState;

    switch(state) {
        case pauseState:        symbol = pauseStatus;                   break;       
        case playState:         symbol = playStatus;                    break; 
        case waitingState:      symbol = waitingStatus;                 break; 
        case checkmarkState:    symbol = checkmarkStatus;               break;  
        case wrongState:                                                break;
    }

    statusObject.innerHTML = symbol;
    statusObject.style = statusStyle + " color: " + color + ";";
}


function playBeep(duration, frequency=settings.toneHz, volume=1.0, wave="sine") {
    return new Promise((resolve) => {    
        const fadeTaper = 5 / 1000;         
        const ctx = initAudioContext();
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.type = wave;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination); 
        
        // Fade in on start to avoid clicks
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + fadeTaper); 
        oscillator.start(ctx.currentTime);

        // Fade out on end to avoid clicks
        let stopTime = ctx.currentTime + duration / 1000;
        gainNode.gain.setValueAtTime(volume, stopTime - fadeTaper); 
        gainNode.gain.linearRampToValueAtTime(0.0001, stopTime); 
        oscillator.stop(stopTime);

        // Resolve the promise when the oscillator stops
        oscillator.onended = () => {
            resolve();
        };
    });
}


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// inter-character spaces are 3 units long
// inter-word spaces are 7 units long
// because every morse element (dit or dah) already has charUnit space, subtract that out
function farnsworthWordUnit() {
    return (60000 *  settings.charWPM - 37200 *  settings.wordWPM) / ( settings.charWPM *  settings.wordWPM) / 19; 
}


// Function to play a sequence of beeps with pauses
// . = 1 char unit tone, followed by 1 char unit space
// - = 3 char unit tone, followed by 1 char unit space
//   = 3 word unit space minus 1 char unit space already applied
// / = 7 word unit space minus 1 char unit space already applied
async function playMorse(pattern) {
    const ctx = initAudioContext();
    if (ctx.state !== 'running') {
        console.error('AudioContext is not running. Please trigger with user interaction.');
        return;
    }

    let charUnit = 1200 /  settings.charWPM;
    let wordUnit = farnsworthWordUnit();
   
    for (let ch of pattern) {
        switch (ch) {
        case ' ':   // character space
            await delay(wordUnit * 3 - charUnit);
            break;
        case '/':   // word space
            await delay(wordUnit * 7 - charUnit);
            break;
        case '.':
            await playBeep(charUnit);
            await delay(charUnit);
            break;
        case '-':
            await playBeep(3 * charUnit);
            await delay(charUnit);
            break;
        }
    }
}


// Show the morse code when hovering over header
function showSymbol(element) {
    if (element.target.innerHTML.length != 1)
        return;
    let uni = "";
    for (let ch of morse[element.target.innerHTML]) 
        uni += (ch=='.') ? "\u2022" : "\u2012";
    element.target.title = uni;
}


// Play the morse code when the header is clicked
function playSymbol(element) {
    if (element.target.innerHTML.length != 1)
        return;    
    if (state == pauseState) {
        setState(playState);
        playMorse(morse[element.target.innerHTML]).then(() => {
            setState(pauseState);
        });
    }
}


function symbolToIdSuffix(symbol) {
    switch (symbol) {
    case '.':   return "_period";
    case ',':   return "_comma";
    case '?':   return "_query";
    case '/':   return "_slash";
    case '=':   return "_BT"; 
    case '+':   return "_AR"; 
    case '\\':  return "_SK"; 
    default:    return symbol;
    }
}


function scrambleArray(array) {
    // Fisher-Yates shuffle
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}


function scrambleString(str) {
  const array = str.split('');
  scrambleArray(array);
  return array.join('');
}


function createWords() {
    // figure out which words can be made with enabledSymbols
    let list = [];
    for (let word of words) {
        missingLetterForWord:
        for (let ch of word) {
            if (!enabledSymbols.includes(ch))
                break missingLetterForWord;
        }
        list.push(word);
    }
    scrambleArray(list);
    let isPeriod = enabledSymbols.includes(".");
    let isComma =  enabledSymbols.includes(","); 
    randomWords = "";
    while (list.length > 0 && randomWords.length < 61) {
        if (randomWords.length > 0)
            randomWords += " ";
        randomWords += list.pop();
        if (isPeriod && Math.random() < .25)
            randomWords += ".";
        else if(isComma && Math.random() < .25)
            randomWords += ",";
    }
    return randomWords;
}


function highestLessonAvailable() {
    let enabled = Number(document.getElementById('kochEnabled').value) / 2;
    if (enabled < 4)
        return enabled;
    else if (enabled < 6)
        return 6;        // 8 characters starts review process
    else if (enabled < 13)
        return 7;       // 12 characters has sufficent letters for a bunch of word
    else
        return 8;       // 26 characters has  K,N,W for call signs, at least a few numbers for call signs and Q for Q codes
}


function setEnabledSymbols() {
    // calculate enabled symbols based on drop down selectors
    let enabled = Number(document.getElementById('kochEnabled').value);
    const includesObject = document.getElementById('lessons');
    let lessons = Number(includesObject.value);

    const options = includesObject.options;

    for (let option of options) 
        option.disabled = (option.value > highestLessonAvailable());
 
    if (enabled >= settings.kochMethodOrder.length) {
        enabled = settings.kochMethodOrder.length;
        document.getElementById('kochEnabled').value = enabled;
    }

    let odd = (enabled%2);
    let start = 0;
    switch (lessons) {
        case 1:     start = enabled - 2 - odd;     break;
        case 2:     start = enabled - 4 - odd;     break;
        case 3:     start = enabled - 6 - odd;     break;
        case 4:     start = 0;                     break;
    }
    if (start < 0)
        start = 0;
    enabledSymbols = settings.kochMethodOrder.slice(start, enabled); 
    isCharLesson = false;
    document.getElementById('enabledChars').value = enabledSymbols;  
}


function highlightEnabledSymbols() {
    // highlight enabled symbols
    for (let symbol of allSymbols) {
        let element = document.getElementById("char" + symbolToIdSuffix(symbol));
        let style = "";
        if (!enabledSymbols.includes(symbol))
            style = "color:gray; font-weight:normal;";
        element.style = style;
    } 
}


function createLesson() {
    remainingLessonChars = "";

    let lesson = Number(lessonsObject.value);

    switch (lesson) {
        case 1: 
        case 2: 
        case 3: 
        case 4:
            remainingLessonChars = enabledSymbols.repeat(Math.floor(60 / enabledSymbols.length));
            let extra = scrambleString(enabledSymbols);
            remainingLessonChars += extra.slice(0,60-remainingLessonChars.length);
            remainingLessonChars = scrambleString(remainingLessonChars);
            break;
        case 5: // all characters focusing on accuracy
            break;
        case 6: // all characters focusing on speed
            break;
        case 7:
            remainingLessonChars = createWords();
            break;
        case 8:
            break;
    }

    lessonCharsLength = remainingLessonChars.length;
    const arr = remainingLessonChars.split('');

    if (lesson == 1) {
        // try to eliminate runs of 3 or more, may leave run at end
        for (let i=0; i<lessonCharsLength-4; i++) {
            if (arr[i] == arr[i+1] && arr[i] == arr[i+2]) {
                for (let j=0; j<100; j++) {
                    // try characters after the set have already been corrected
                    let n = lessonCharsLength - i - 2; 
                    let r = i + 2 + Math.floor(Math.random() * n);
                    if (arr[i] != arr[r]) {
                        [arr[i], arr[r]] = [arr[r], arr[i]]; // Swap elements
                        break;
                    }
                }
            }
        }
    }
    else if (lesson <= 6) {
        // try to eliminate runs of 2 or more, may leave run at end
        for (let i=0; i<lessonCharsLength-3; i++) {
            if (arr[i] == arr[i+1]) {
                for (let j=0; j<100; j++) {
                    // try characters after the set have already been corrected 
                    let n = lessonCharsLength - i - 1; 
                    let r = i + 1 + Math.floor(Math.random() * n);
                    if (arr[i] != arr[r]) {
                        [arr[i], arr[r]] = [arr[r], arr[i]]; // Swap elements
                        break;
                    }
                }
            }
        }
    }

    remainingLessonChars = arr.join('');
    correctInRow = 0;
    correctChars = 0;
    wrongChars   = 0;
}


function startLesson() {
    setState(playState);
    createLesson();
    runTimer = window.setTimeout(sendNextCharacter, settings.resetMs);
    lastCharSent = "";
    textObject.innerHTML = "";
}


function stopLesson() {
    clearTimeout(runTimer);
    clearTimeout(timeoutTimer);
    clearInterval(progressTimer);
    setState(pauseState);

    if (!isCharLesson) {
        if (correctInRow > settings.advanceSuccessive || 100*correctChars/lessonCharsLength >= settings.advancePercent) {
            let soundFile = new Audio("Tada.wav");
            soundFile.play();

            // TODO - control via auto advance checkbox
            if (++lessonsObject.value > highestLessonAvailable()) {
                lessonsObject.value = 1;
                kochEnabledObject.value = Number(kochEnabledObject.value) + 2;
            } 
        }
        else {
            let soundFile = new Audio("BannanaSlip.wav");
            soundFile.play();
        }
        if (isNewSession) {
            sessions.push(new Session());
            isNewSession = false;
        }
        let last = sessions[sessions.length-1];
        let lessonTime = 0;     // TODO - track lessonTime
        let speed = 0;          // TODO - track speed
        sessions[sessions.length-1] = new Session(last.date, last.duration+lessonTime, settings.charWPM, settings.wordWPM, speed, kochEnabledObject.value, lessonsObject.value, last.wrong+wrongChars,last.correct+correctChars);
        localStorage.setItem("morseCodeTrainer.sessions", JSON.stringify(sessions));
    }
}


function sendNextCharacter() {
    if (remainingLessonChars == "" || correctInRow >= settings.advanceSuccessive) 
        stopLesson();
    else {
        let send = remainingLessonChars[0];
        remainingLessonChars = remainingLessonChars.slice(1); 
        setState(playState);
        progressObject.value = 0;
        playMorse(morse[send]).then(() => {
            if (state == playState) {
                setState(waitingState);
                progressStartTime = Date.now();
                progressTimer = window.setInterval(() => {
                    progressObject.value = Date.now() - progressStartTime;
                }, 100);
                lastCharSent = send;
                timeoutTimer = window.setTimeout(timeoutWithoutKeypress, responseTimeoutMs);
            }
        });
    }
}


function updateResults() {
    resultsObject.innerHTML = String(correctInRow).padStart(2) + " in a row &#x2014; " + String(correctChars).padStart(2) + " / " + String(correctChars+wrongChars).padStart(2) + " correct &#x2014; " + String(correctChars+wrongChars).padStart(2) + " / " + String(lessonCharsLength).padStart(2) + " sent"
}


function timeoutWithoutKeypress() {
    setState(wrongState, lastCharSent, "orange");
    clearInterval(progressTimer);
    progressObject.value = progressObject.max;
    textObject.innerHTML += '<SPAN style="color:orange";>' + lastCharSent + '</SPAN>';
    runTimer = window.setTimeout(sendNextCharacter, settings.resetMs);
    playBeep(200,200,.2,"square");
    lastCharSent = "";
    wrongChars++;
    updateResults();
}


// time the keystroke from when the character was sent
document.addEventListener('keydown', (evt) => {
    if (evt.key == "Escape") {
        if (state == pauseState)
            startLesson();
        else
            stopLesson();        
    }
    if (evt.key && lastCharSent != "") {
        clearTimeout(timeoutTimer);
        clearInterval(progressTimer);
        if (lastCharSent == evt.key.toUpperCase()) {
            setState(checkmarkState);
            textObject.innerHTML += evt.key.toUpperCase();
            runTimer = window.setTimeout(sendNextCharacter, responseTimeoutMs-(Date.now()-progressStartTime));
            correctInRow++;
            correctChars++;
            updateResults();
        }
        else {
            setState(wrongState, lastCharSent, "red");
            textObject.innerHTML += '<SPAN style="color:red";>' + lastCharSent + '</SPAN>';
            runTimer = window.setTimeout(sendNextCharacter, settings.resetMs);
            playBeep(200,200,.2,"square");
            correctInRow = 0;
            wrongChars++;
            updateResults();
        }
        lastCharSent = "";
    }
});


function updateCharMs() {
     const charMsObject = document.getElementById('charMs');
     charMsObject.value = responseTimeoutMs = Math.floor(farnsworthWordUnit() * 3);
     progressObject.max = charMsObject.value;
}


function initalizeSettings() {
    document.getElementById('charWPM').value           = settings.charWPM;
    document.getElementById('wordWPM').value           = settings.wordWPM;
    document.getElementById('kochOrder'). value        = settings.kochMethodOrder;
    document.getElementById('advancePercent').value    = settings.advancePercent
    document.getElementById('advanceSuccessive').value = settings.advanceSuccessive;
    document.getElementById('resetMs').value           = settings.resetMs;
    document.getElementById('toneHz').value            = settings.toneHz;
    updateCharMs();
}


function updateSettings() {
    settings.charWPM           = Number(document.getElementById('charWPM').value);
    settings.wordWPM           = Number(document.getElementById('wordWPM').value);
    settings.kochMethodOrder   = document.getElementById('kochOrder').value;
    settings.advancePercent    = Number(document.getElementById('advancePercent').value);
    settings.advanceSuccessive = Number(document.getElementById('advanceSuccessive').value);
    settings.resetMs           = Number(document.getElementById('resetMs').value);
    settings.toneHz            = Number(document.getElementById('toneHz').value);
    updateCharMs();
    localStorage.setItem("morseCodeTrainer.settings", JSON.stringify(settings));
}


function populateSessionsTable() {
    const tableBody = document.getElementById('sessions').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Clear existing rows

    sessions.forEach(item => {
        let row = tableBody.insertRow();
        let date = new Date(item.date);
        row.insertCell(0).innerHTML = date.toLocaleDateString() + " " + date.toLocaleTimeString();
        row.insertCell(1).innerHTML = Math.floor(item.duration/60).toString() + ":" + (item.duration%60).toString().padStart(2,"0");
        row.insertCell(2).innerHTML = item.correct.toString() + " / " + (item.correct+item.wrong).toString();
        row.insertCell(3).innerHTML = item.finalEnabled.toString();
        row.insertCell(4).innerHTML = item.finalLesson.toString();
        row.insertCell(5).innerHTML = item.charWPM.toString();
        row.insertCell(6).innerHTML = item.wordWPM.toString();
        row.insertCell(7).innerHTML = item.speed.toString();
    });
}


// Initialize the graph structure with headers and empty rows
function initializeGraph() {
    const chart = document.getElementById('chart');

    // Create empty rows
    for (let symbol of enabledSymbols) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'chart-row';
        rowDiv.id = "row-" + symbolToIdSuffix(symbol)
        rowDiv.innerHTML = '<div class="bar-character morse">' + symbol + '</div>' +
                           '<div class="bar-conflate morse"></div>' + 
                           '<div class="bar-container"></div>';
        chart.appendChild(rowDiv);
    }
}

// Update rows with new data
function updateGraph() {
    let maxTotal = 0;
    for (let symbol of enabledSymbols) {
        const stat = statistics[symbol];
        const total = stat.wrong + stat.timeout + stat.correct;
        if (total > maxTotal)
            maxTotal = total;
    }

    for (let symbol of enabledSymbols) {
        const rowDiv = document.getElementById("row-" + symbolToIdSuffix(symbol));
        const stat = statistics[symbol];
        if (!rowDiv || stat == undefined) 
            return;

        // Update label
        // const label = rowDiv.querySelector('.bar-container');
        // label.textContent = row.label;

        // Update conflated
        const textField = rowDiv.querySelector('.bar-conflate');
        // TODO add handler for playing morse code
        textField.textContent = stat.conflated;

        // Update bars
        const barContainer = rowDiv.querySelector('.bar-container');
        barContainer.innerHTML = ''; // Clear existing bars
        for (let tag of ["wrong", "timeout", "correct"]) {
            const bar = document.createElement('div');
            bar.className = 'bar bar-' + tag;
            bar.style.width = ((stat[tag] / maxTotal) * 100).toString() + '%';
            barContainer.appendChild(bar);
        }
    }
}


// DOM loaded, register objects
document.addEventListener('DOMContentLoaded', () => {
    initializeGraph();
    updateGraph();

    // iterate off of class name
    const elements = document.querySelectorAll('.morse');
    for(let element of elements) {
        element.addEventListener('mouseover', showSymbol); 
        element.addEventListener('click', playSymbol); 
    }

    progressObject = document.getElementById('progress');
    resetObject    = document.getElementById('resetMs');
    textObject     = document.getElementById('text');
    resultsObject  = document.getElementById('results');

    if (localStorage.getItem("morseCodeTrainer.settings") !== null)
        settings = JSON.parse(localStorage.getItem("morseCodeTrainer.settings"));
    if (localStorage.getItem("morseCodeTrainer.sessions") !== null)
        sessions = JSON.parse(localStorage.getItem("morseCodeTrainer.sessions"));

    populateSessionsTable();

    initalizeSettings();
 
    if (sessions.length)  {
        document.getElementById('kochEnabled').value = sessions[sessions.length-1].finalEnabled;
        document.getElementById('lessons').value     = sessions[sessions.length-1].finalLesson;
    }
    else {
        document.getElementById('kochEnabled').value = 2;
        document.getElementById('lessons').value     = 1;
     }
    // special handling of char and word WPM needed because wordWPM must be less than or equal to charWPM
    const charWPMObject = document.getElementById('charWPM');
    const wordWPMObject = document.getElementById('wordWPM');
 
    charWPMObject.addEventListener('input', () => {
        settings.charWPM = parseInt(charWPMObject.value);
        if (settings.wordWPM > settings.charWPM) {
            settings.wordWPM    =  settings.charWPM;
            wordWPMObject.value =  settings.wordWPM;
        }
        updateCharMs();
    });

    wordWPMObject.addEventListener('input', () => {
         settings.wordWPM = parseInt(wordWPMObject.value);
        if ( settings.wordWPM > settings.charWPM) {
            settings.charWPM    =  settings.wordWPM;
            charWPMObject.value =  settings.charWPM;
        }
        updateCharMs();
    }); 

    setEnabledSymbols();
    highlightEnabledSymbols();
    updateResults();

    const enabledCharsObject = document.getElementById('enabledChars');
    enabledCharsObject.addEventListener('change', () => {
        enabledSymbols = enabledCharsObject.value.toUpperCase();
        isCharLesson = true;
        highlightEnabledSymbols();
    });
    
    kochEnabledObject = document.getElementById('kochEnabled');
    lessonsObject = document.getElementById('lessons');

    kochEnabledObject.addEventListener('change', () => {
        if (lessonsObject.value > highestLessonAvailable())
            lessonsObject.value = highestLessonAvailable();
        setEnabledSymbols();
        highlightEnabledSymbols();
    });

    lessonsObject.addEventListener('change', () => {
        setEnabledSymbols();
        highlightEnabledSymbols();
    });

    const statusObject = document.getElementById('status');
    statusObject.addEventListener('click', () => {
        if (state == pauseState)
            startLesson();
        else
            stopLesson();
    });

    const settingsTableObject = document.getElementById('settings');
    settingsTableObject.addEventListener('change', () => {
        updateSettings();
    });
});
