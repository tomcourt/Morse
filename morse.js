// TODO FEATURES
// Auto advance UI checkbox control
// Timer defered adding wrong to Statistic and results
// Local storage, reset button w. confirmation for each section
// Handle the odd number of prosigns
// Speed dither and tone dither (never allow charWPM to exceed wordWPM)
// Implement improvement lessons (accuracy, speed, least heard)
// BUG - Words lesson not handling spaces
// Implement QSOs using template system [KNW][0-9][A-Z][A-Z]{|[A-Z]}{|||/P|/A|/[0-9]}
// Animate updated of graphs with jQuery
// Add cumulative and session to graphs, allow scrolling through sessions to show progress
// Limit sessions to 100 or so to avoid using all the localStorage
// Session statistics data is stored as seperate local storage element using date as key
// Add labels to right side of graphs (small text)
// Protosigns and keyboard characters for graphs
// Summary of sessons and character by character of sessions
// Sad trombone to replace bananna peel
// Option to ignore results on aborted lesson
// Use tick syntax for formatted strings
// Move all style out of HTML and into CSS
// Allow copy behind option, will show orange for missed characters (timeout or wrong)
// Add grace ms to allow copy behind, if symbol is typed within grace its correct
// Bad characters are shown orange until lesson is done, then an analysis is done to determine if timeout or wrong
// suggested algorithm - Keep track of what is typed by user, add * for any timeouts. Permutate replacing * with correct character(wrong character typed) or empty character(timeout) to find least wrong characters (while not adding more characters than sent)
// Add optional visual timeout/error, background for whole window goes red/yellow/orange for buzzer duration
// Add volume levels for buzzer, fail/success sounds, these also double up as a way to disable each sound effect



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
let lessonStartTIme = 0;
let correctInRow = 0;
let lessonCharsLength = 0;
let isCharLesson = false;
let isNewSession = true;
let isPercentResults = false;

let pauseState=0, playState=1, waitingState=2, checkmarkState=3, wrongState=4; 
let state = pauseState;

let progressTimer;
let progressStartTime;



// basic english dictionary (850 words)
const words = "COME GET GIVE GO KEEP LET MAKE PUT SEEM TAKE BE DO HAVE SAY SEE SEND MAY WILL ABOUT ACROSS AFTER\
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



function Setting() {
    this.charWPM           = 18;
    this.wordWPM           = 5;
    this.resetMs           = 1000;
    this.toneHz            = 750;
    this.kochMethodOrder   = "KMRSUAPTLOWI.NJEF0Y,VG5/Q9ZH38B?427C1D6X=\\+";
    this.advancePercent    = 95;
    this.advanceSuccessive = 20;
}

let settings = JSON.parse(localStorage.getItem("morseCodeTrainer.settings")) ?? new Setting();



function Statistic(char="", wrong=0, timeout=0, correct=0, fast=9999, slow=0, total=0, conflated="") {
    this.char      = char;
    this.wrong     = wrong;              
    this.timeout   = timeout;
    this.correct   = correct;
    this.fast      = fast;             
    this.slow      = slow; 
    this.total     = total;      // total time, divide by correct to get average time
    this.conflated = conflated; 
}

function accumulateStat(dest, source) {
    if (source.conflated != "")
        dest.conflated = source.conflated;

    dest.correct += source.correct;
    dest.timeout += source.timeout;
    dest.wrong   += source.wrong;

    dest.total += source.total;
    dest.slow = Math.max(dest.slow, source.slow);
    dest.fast = Math.min(dest.fast, source.fast);
}

let lessonStat;
let sessionStat;



function Statistics() {
    for (let symbol of allSymbols)
        this[symbol] = new Statistic(symbol);
}

function accumulateStats(dest, source) {
    for (symbol of allSymbols) 
        accumulateStat(dest[symbol], source[symbol]);
}

let lessonStats     = new Statistics();
let sessionStats    = new Statistics();
let cumulativeStats = JSON.parse(localStorage.getItem("morseCodeTrainer.cumulativeStats")) ?? new Statistics();
let displayStats    = sessionStats;         // this is a reference to session or cumulative


function Session(date=Date.now(), duration=0, lessons=0, charWPM=18, wordWPM=5, finalEnabled=2, finalLesson=1, stat=new Statistic())  {
    this.date         = date;
    this.duration     = duration;
    this.lessons      = lessons;
    this.charWPM      = charWPM;
    this.wordWPM      = wordWPM;
    this.finalEnabled = finalEnabled;
    this.finalLesson  = finalLesson;
    this.stat         = new Statistic(undefined, stat.wrong, stat.timeout, stat.correct, stat.fast, stat.slow, stat.total);
}

let sessions = JSON.parse(localStorage.getItem("morseCodeTrainer.sessions")) ?? []; 
let currentSession;


function openTab(evt, tabName) {
    removeClass($$('.tab-content'),'active');   // Hide all tab content    
    removeClass($$('.tab-button'), 'active');   // Remove active class from all buttons
    addClass($('#'+tabName),'active');          // Show the selected tab content
    addClass(evt.currentTarget,'active');       // Make clicked button show selected
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
function setState(newState, symbol='', color='black') {
    const pauseStatus     = '&#x23F8';  // pause symbol
    const playStatus      = '&#x23F5';  // play symbol
    const waitingStatus   = '&#x23F1';  // clock symbol
    const checkmarkStatus = '&#x2713';  // checkmark symbol

    state = newState;
    switch(state) {
        case pauseState:        symbol = pauseStatus;                   break;       
        case playState:         symbol = playStatus;                    break; 
        case waitingState:      symbol = waitingStatus;                 break; 
        case checkmarkState:    symbol = checkmarkStatus;               break;  
        case wrongState:        /* use passed function parameter */     break;
    }
    $('#status').innerHTML = symbol;
    $('#status').style.color = color;
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
            await delay(charUnit);      // delays front loaded to allow instant by student
            await playBeep(charUnit);
            break;
        case '-':
            await delay(charUnit);      // delays front loaded to allow instant by student
            await playBeep(3 * charUnit);
            break;
        }
    }
}


// Show the morse code when hovering over header, replace . and - with nicer unicode symbols
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
    randomWords = '';
    while (list.length > 0 && randomWords.length < 61) {
        if (randomWords.length > 0)
            randomWords += ' ';
        randomWords += list.pop();
        if (isPeriod && Math.random() < .25)
            randomWords += '.';
        else if(isComma && Math.random() < .25)
            randomWords += ',';
    }
    return randomWords;
}


function highestLessonAvailable() {
    let enabled = Number($('#kochEnabled').value) / 2;
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
    let enabled = Number($('#kochEnabled').value);
    let lessons = Number($('#lessons').value);

    const options = $('#lessons').options;

    for (let option of options) 
        option.disabled = (option.value > highestLessonAvailable());
 
    // check if enabled is set to more symbols than we have
    if (enabled >= settings.kochMethodOrder.length) {
        enabled = settings.kochMethodOrder.length;
        $('#kochEnabled').value = enabled;
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
    $('#enabledChars').value = enabledSymbols;  
}


function highlightEnabledSymbols() {
    for (let element of $$('.bar-character')) 
        if (enabledSymbols.includes(element.innerHTML))
            element.classList.remove('disabled-char');
        else
            element.classList.add('disabled-char');
}


function createLesson() {
    remainingLessonChars = "";

    let lesson = Number($('#lessons').value);

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

    const arr = remainingLessonChars.split('');

    if (lesson == 1) {
        // try to eliminate runs of more than 3, sometimes leaves a run at the end 
        for (let i=3; i<arr.length-1; i++) {
            if (arr[i-3] == arr[i] && arr[i-2] == arr[i] && arr[i-1] == arr[i]) {
                for (let j=0; j<10; j++) {
                    // try characters after the set have already been corrected
                    let n = arr.length - i - 1; 
                    let r = i + 1 + Math.floor(Math.random() * n);
                    if (arr[i] != arr[r]) {
                        [arr[i], arr[r]] = [arr[r], arr[i]]; // Swap elements
                        break;
                    }
                }
            }
        }
    }
    else if (lesson <= 6) {
        // try to eliminate runs of more than 2, sometimes leaves a run at the e
        for (let i=2; i<arr.length-1; i++) {
            if (arr[i-2] == arr[i] && arr[i-1] == arr[i]) {
                for (let j=0; j<10; j++) {
                    // try characters after the set have already been corrected 
                    let n = arr.length - i - 1; 
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
    lessonCharsLength = remainingLessonChars.length;
    correctInRow = 0;
    lessonStat = new Statistic();
    lessonStats = new Statistics();
}


function updateStatsAndSession() {
    if (isNewSession) {
        currentSession = new Session()
        sessionStat = currentSession.stat;
        sessions.push(currentSession);
        isNewSession = false;
    }
    if (lessonStat.fast == 9999)
        lessonStat.fast = 0;
    if (lessonStat.correct == 0)
        lessonStat.average = 0;
    else
        lessonStat.average = Math.round(lessonStat.total / lessonStat.correct);
    $('#results').textContent = `${lessonStat.wrong} wrong, ${lessonStat.timeout} timeout, ${lessonStat.correct} correct  ---  ` +
                                `${lessonStat.fast}ms fast, ${lessonStat.average}ms avg, ${lessonStat.slow}ms slow`;
    accumulateStat(sessionStat, lessonStat);        
    accumulateStats(sessionStats, lessonStats);
    // maxChars and maxTime are used for graphing the sessions 
    sessionStat.maxChars = 0;
    sessionStat.maxTime = 0;
    for (let symbol of allSymbols) {
        let stat = lessonStats[symbol];
        let chars = stat.correct + stat.timeout + stat.wrong;
        if (chars > sessionStat.maxChars)
            sessionStat.maxChars = chars;
        if (stat.slow > sessionStat.maxTime)
            sessionStat.maxTime = stat.slow;
    }
    accumulateStats(cumulativeStats, lessonStats);

    currentSession.duration += Math.round((Date.now() - lessonStartTime) / 1000);
    currentSession.lessons++;
    currentSession.charWPM = settings.charWPM;
    currentSession.wordWPM = settings.wordWPM;
    currentSession.finalEnabled = Number($('#kochEnabled').value); 
    currentSession.finalLesson  = Number($('#lessons').value); 
    
    localStorage.setItem("morseCodeTrainer.sessions",                     JSON.stringify(sessions));
    localStorage.setItem("morseCodeTrainer.cumulativeStats",              JSON.stringify(cumulativeStats));
    localStorage.setItem(`morseCodeTrainer.stats.${currentSession.date}`, JSON.stringify(sessionStats));    
    
    updateGraph();
}


function startLesson() {
    setState(playState);
    createLesson();
    lessonStartTime = Date.now();
    runTimer = window.setTimeout(sendNextCharacter, settings.resetMs);
    lastCharSent = '';
    $('#text').innerHTML = '';
    $('#results').textContent = "Concentrate on the sound";
}


function stopLesson() {
    clearTimeout(runTimer);
    clearTimeout(timeoutTimer);
    clearInterval(progressTimer);
    setState(pauseState);

    if (!isCharLesson) {
        if (correctInRow >= settings.advanceSuccessive || 100*lessonStat.correct/lessonCharsLength >= settings.advancePercent) {
            let soundFile = new Audio('Tada.wav');
            soundFile.volume = .5;
            soundFile.play();

            if ($('#advanceGoal').checked) {
                if (++$('#lessons').value > highestLessonAvailable()) {
                    $('#lessons').value = 1;
                    $('#kochEnabled').value = Number($('#kochEnabled').value) + 2;
                } 
            }
        }
        else {
            let soundFile = new Audio('SadTrombone.mp3');
            soundFile.volume = .5;
            soundFile.play();
        }
        updateStatsAndSession();
    }
}


function timeoutWithoutKeypress() {
    setState(wrongState, lastCharSent, 'orange');
    clearInterval(progressTimer);
    $('#progress').value = $('#progress').max;
    $('#text').innerHTML += '<SPAN style="color:orange";>' + lastCharSent + '</SPAN>';
    runTimer = window.setTimeout(sendNextCharacter, settings.resetMs);
    $('#body').style.backgroundColor = 'orange';
    if ($('#typeBehind').checked) {
        delay(200).then(
            function() { $('#body').style.backgroundColor = 'white';},
        );
    }
    else {
        playBeep(200,200,.2,'square').then(
            function() { $('#body').style.backgroundColor = 'white';},
        );
    }
    lessonStat.timeout++;
    lessonStats[lastCharSent].timeout++;
    lastCharSent = '';
}


function sendNextCharacter() {
    if (lastCharSent != '') {
        timeoutWithoutKeypress();
    }
    if (remainingLessonChars == '' || correctInRow >= settings.advanceSuccessive) 
        stopLesson();
    else {
        let send = remainingLessonChars[0];
        remainingLessonChars = remainingLessonChars.slice(1); 
        setState(playState);
        $('#progress').value = 0;
        playMorse(morse[send]).then(() => {
            if (state == playState) {
                setState(waitingState);
                progressStartTime = Date.now();
                progressTimer = window.setInterval(() => {
                    $('#progress').value = Date.now() - progressStartTime;
                }, 100);
                lastCharSent = send;
                timeoutTimer = window.setTimeout(timeoutWithoutKeypress, responseTimeoutMs);
            }
        });
    }
}


// time the keystroke from when the character was sent
document.addEventListener('keydown', (evt) => {
    if (evt.key == 'Escape') {
        if (state == pauseState)
            startLesson();
        else
            stopLesson();        
    }
    if (evt.key && lastCharSent != '') {
        clearTimeout(timeoutTimer);
        clearInterval(progressTimer);
        if (lastCharSent == evt.key.toUpperCase()) {
            setState(checkmarkState);
            $('#text').innerHTML += evt.key.toUpperCase();
            let interval = Date.now() - progressStartTime;
            runTimer = window.setTimeout(sendNextCharacter, responseTimeoutMs-interval);
            correctInRow++;
            lessonStat.slow = Math.max(lessonStat.slow, interval);
            lessonStat.fast = Math.min(lessonStat.fast, interval);
            lessonStat.total += interval;
            lessonStat.correct++;
            lessonStats[lastCharSent].slow = Math.max(lessonStats[lastCharSent].slow, interval);
            lessonStats[lastCharSent].fast = Math.min(lessonStats[lastCharSent].fast, interval);
            lessonStats[lastCharSent].total += interval;
            lessonStats[lastCharSent].correct++;
        }
        else {
            setState(wrongState, lastCharSent, 'red');
            $('#text').innerHTML += '<SPAN style="color:red";>' + lastCharSent + '</SPAN>';
            runTimer = window.setTimeout(sendNextCharacter, settings.resetMs);
            $('#body').style.backgroundColor = 'red';
            if ($('#typeBehind').checked) {
                delay(200).then(
                    function() { $('#body').style.backgroundColor = 'white';},
                );
            }
            else {
                playBeep(200,200,.2,'square').then(
                    function() { $('#body').style.backgroundColor = 'white';},
                );
            }
            correctInRow = 0;
            lessonStat.wrong++;
            lessonStats[lastCharSent].conflated = evt.key.toUpperCase();
            lessonStats[lastCharSent].wrong++;
        }
        lastCharSent = '';
    }
});


function updateCharMs() {
     $('#charMs').value = responseTimeoutMs = Math.floor(farnsworthWordUnit() * 3);
     $('#progress').max = $('#charMs').value;
}


function initalizeSettings() {
    $('#charWPM').value           = settings.charWPM;
    $('#wordWPM').value           = settings.wordWPM;
    $('#kochOrder'). value        = settings.kochMethodOrder;
    $('#advancePercent').value    = settings.advancePercent
    $('#advanceSuccessive').value = settings.advanceSuccessive;
    $('#advanceGoal').checked     = settings.advanceGoal;
    $('#typeBehind').checked      = settings.typeBehind;
    $('#resetMs').value           = settings.resetMs;
    $('#toneHz').value            = settings.toneHz;
    updateCharMs();
}


function updateSettings() {
    settings.charWPM           = Number($('#charWPM').value);
    settings.wordWPM           = Number($('#wordWPM').value);
    settings.kochMethodOrder   = $('#kochOrder').value;
    settings.advancePercent    = Number($('#advancePercent').value);
    settings.advanceSuccessive = Number($('#advanceSuccessive').value);
    settings.resetMs           = Number($('#resetMs').value);
    settings.toneHz            = Number($('#toneHz').value);
    settings.advanceGoal       = $('#advanceGoal').checked;
    settings.typeBehind        = $('#typeBehind').checked;
    updateCharMs();
    localStorage.setItem("morseCodeTrainer.settings", JSON.stringify(settings));
}


function populateSessionsTable() {
    const tableBody = $('#sessions>tbody');     // find the tbody inside the sessions table
    tableBody.innerHTML = '';                   // Clear existing rows

    sessions.forEach(item => {
        let row = tableBody.insertRow();
        let date = new Date(item.date);
        row.insertCell(0).innerHTML = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        row.insertCell(1).innerHTML = `${Math.floor(item.duration/60)}:${(item.duration%60).toString().padStart(2,'0')}`;
        row.insertCell(2).innerHTML = `${item.stat.correct} / ${item.stat.correct+item.stat.timeout+item.stat.wrong}`;
        row.insertCell(3).innerHTML = `${item.finalEnabled}`;
        row.insertCell(4).innerHTML = `${item.finalLesson}`;
        row.insertCell(5).innerHTML = `${item.charWPM}`;
        row.insertCell(6).innerHTML = `${item.wordWPM}`;
        row.insertCell(7).innerHTML = `${Math.round(item.stat.total/item.stat.correct)}`;
    });
}


// Initialize the graph structure with headers and empty rows
function initializeGraph() {
    const chart = $('#chart');

    // Create empty rows
    for (let symbol of allSymbols) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'chart-row';
        rowDiv.id = "row-" + symbolToIdSuffix(symbol)
        rowDiv.innerHTML = '<div class="bar-character morse">' + symbol + '</div>' +
                           '<div class="bar-conflate morse"></div>' + 
                           '<div class="bar-results"></div>' + 
                           '<div class="bar-speed"></div>';
        chart.appendChild(rowDiv);
    }

    // for class morse, add handlers to show and play morse
    onEvent($$('.morse'), 'mouseover', showSymbol); 
    onEvent($$('.morse'), 'click',     playSymbol); 
}


// Update rows with new data
// maxTotal and maxTime can be pre-calculated to allow for comparing across sessions
function updateGraph(stats = displayStats, isRatio = isPercentResults, maxTotal = 0, maxTime = 0) {
    displayStats = stats;
    isPercentResults = isRatio;
    if (maxTotal == 0 && maxTime == 0) {
        for (let symbol of allSymbols) {
            const stat = stats[symbol];
            const total = stat.wrong + stat.timeout + stat.correct;
            if (total > maxTotal)
                maxTotal = total;
            if (stat.slow > maxTime)
                maxTime = stat.slow;
        }
    }

    for (let symbol of allSymbols) {
        const rowDiv = $('#row-' + symbolToIdSuffix(symbol));
        const stat = Object.assign({}, stats[symbol]); // shallow copy of statistic object
        if (!rowDiv || stat == undefined) 
            return;

        // Update conflated
        const textField = rowDiv.querySelector('.bar-conflate');
        textField.textContent = stat.conflated;

        // Update bars
        const barResults = rowDiv.querySelector('.bar-results');
        barResults.innerHTML = '';    // Clear existing bars
        if (isRatio)
            maxTotal = stat.wrong + stat.timeout + stat.correct;
        for (let tag of ['wrong', 'timeout', 'correct']) {
            const bar = document.createElement('div');
            bar.className = 'bar bar-' + tag;
            bar.style.width = `${stat[tag]*100/maxTotal}%`;
            barResults.appendChild(bar);
        }
        if (isRatio)
            barResults.title = `${Math.round(100*stat.wrong/maxTotal)}% wrong, ${Math.round(100*stat.timeout/maxTotal)}% timeout, ${Math.round(100*stat.correct/maxTotal)}% correct`        
        else
            barResults.title = `${stat.wrong} wrong, ${stat.timeout} timeout, ${stat.correct} correct`
        if (stat.fast == 9999)
            stat.fast = 0;
        if (stat.correct == 0)
            stat.average = 0;
        else
            stat.average = Math.round(stat.total / stat.correct);
        const barSpeed = rowDiv.querySelector('.bar-speed');
        barSpeed.innerHTML = '';    // Clear existing bars
        let last = 0;
        for (let tag of ['fast', 'average', 'slow']) {
            const bar = document.createElement('div');
            bar.className = 'bar bar-' + tag;
            bar.style.width = `${(stat[tag]-last)*100/maxTime}%`;
            last = stat[tag];
            barSpeed.appendChild(bar);
        }
        barSpeed.title = `${stat.fast}ms fastest, ${stat.average}ms average, ${stat.slow}ms slowest`
    }
}


// DOM loaded, register objects
document.addEventListener('DOMContentLoaded', () => {
    // if (confirm("Clear out local storage? Resets all settings, statistics and sescions"))
    //     localStorage.clear();

    populateSessionsTable();

    initalizeSettings();
 
    if (sessions.length)  {
        // use the las sessions progress
        $('#kochEnabled').value = sessions[sessions.length-1].finalEnabled;
        $('#lessons').value     = sessions[sessions.length-1].finalLesson;
    }
    else {
        $('#kochEnabled').value = 2;
        $('#lessons').value     = 1;
    }

    initializeGraph();
    updateGraph();

    // special handling of char and word WPM needed because wordWPM must be less than or equal to charWPM 
    $('#charWPM').addEventListener('input', () => {
        settings.charWPM = parseInt($('#charWPM').value);
        if (settings.wordWPM > settings.charWPM) {
            settings.wordWPM    =  settings.charWPM;
            $('#wordWPM').value =  settings.wordWPM;
        }
        updateCharMs();
    });

    $('#wordWPM').addEventListener('input', () => {
         settings.wordWPM = parseInt($('#wordWPM').value);
        if ( settings.wordWPM > settings.charWPM) {
            settings.charWPM    =  settings.wordWPM;
            $('#charWPM').value =  settings.charWPM;
        }
        updateCharMs();
    }); 

    setEnabledSymbols();
    highlightEnabledSymbols();

    $('#enabledChars').addEventListener('change', () => {
        enabledSymbols = $('#enabledChars').value.toUpperCase();
        isCharLesson = true;
        highlightEnabledSymbols();
    });

    $('#kochEnabled').addEventListener('change', () => {
        if ($('#lessons').value > highestLessonAvailable())
            $('#lessons').value = highestLessonAvailable();
        setEnabledSymbols();
        highlightEnabledSymbols();
    });

    $('#lessons').addEventListener('change', () => {
        setEnabledSymbols();
        highlightEnabledSymbols();
    });

    $('#status').addEventListener('click', () => {
        if (state == pauseState)
            startLesson();
        else
            stopLesson();
    });

    $('#settings').addEventListener('change', () => {
        updateSettings();
    });
});
