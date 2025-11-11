import AMOSListener from "./AMOSListener";
import bankReader from "./src/tools/bankReader/bankReader.js";
class AmosToJavaScriptTranslator extends AMOSListener {
  constructor() {
    super();
    this.imports = `
   
    `;
    this.output = "";
    this.indentLevel = 0; // Track current indentation level
    this.id = 0;
    this.current_Ink = "black";
    this.colorMapping = {
      1: "black",
      2: "white",
      3: "red",
      5: "green",
      8: "rgb(160, 64, 0)",
    };
    this.pallette = `const colorMapping = ${JSON.stringify(
      this.colorMapping,
      null,
      2
    )};`;
    this.lineData = this.lineData || [];
    this.globalVariables = "";
    this.globalVariablesStorage = {};
    this.functionStarters = ``;
    this.variables = {};
    this.output += `
    
      const keyMapping = {
        1: "Escape",
        2: "Digit1",
        3: "Digit2",
        4: "Digit3",
        5: "Digit4",
        6: "Digit5",
        7: "Digit6",
        8: "Digit7",
        9: "Digit8",
        10: "Digit9",
        11: "Digit0",
        12: "Minus",
        13: "Equal",
        14: "Backspace",
        15: "Tab",
        16: "KeyQ",
        17: "KeyW",
        18: "KeyE",
        19: "KeyR",
        20: "KeyT",
        21: "KeyY",
        22: "KeyU",
        23: "KeyI",
        24: "KeyO",
        25: "KeyP",
        26: "BracketLeft",
        27: "BracketRight",
        28: "Enter",
        29: "ControlLeft",
        30: "KeyA",
        31: "KeyS",
        32: "KeyD",
        33: "KeyF",
        34: "KeyG",
        35: "KeyH",
        36: "KeyJ",
        37: "KeyK",
        38: "KeyL",
        39: "Semicolon",
        40: "Quote",
        41: "Backquote",
        42: "ShiftLeft",
        43: "Backslash",
        44: "KeyZ",
        45: "KeyX",
        46: "KeyC",
        47: "KeyV",
        48: "KeyB",
        49: "KeyN",
        50: "KeyM",
        51: "Comma",
        52: "Period",
        53: "Slash",
        54: "ShiftRight",
        55: "NumpadMultiply",
        56: "AltLeft",
        57: "Space",
        58: "CapsLock",
        59: "F1",
        60: "F2",
        61: "F3",
        62: "F4",
        63: "F5",
        64: "F6",
        65: "F7",
        66: "F8",
        67: "F9",
        68: "F10",
        69: "Pause",
        70: "ScrollLock",
        71: "Numpad7",
        72: "Numpad8",
        73: "Numpad9",
        74: "NumpadSubtract",
        75: "Numpad4",
        76: "Numpad5",
        77: "Numpad6",
        78: "NumpadAdd",
        79: "Numpad1",
        80: "Numpad2",
        81: "Numpad3",
        82: "Numpad0",
        83: "NumpadDecimal",
        84: "IntlBackslash",
        85: "F11",
        86: "F12",
        87: "NumpadEqual",
        88: "F13",
        89: "F14",
        90: "F15",
        91: "F16",
        92: "F17",
        93: "F18",
        94: "F19",
        95: "F20",
        96: "F21",
        97: "F22",
        98: "F23",
        99: "F24",
        100: "NumpadComma",
        101: "Lang1",
        102: "Lang2",
        103: "NumpadEnter",
        104: "ControlRight",
        105: "NumpadDivide",
        106: "PrintScreen",
        107: "AltRight",
        108: "NumLock",
        109: "Home",
        110: "ArrowUp",
        111: "PageUp",
        112: "ArrowLeft",
        113: "ArrowRight",
        114: "End",
        115: "ArrowDown",
        116: "PageDown",
        117: "Insert",
        118: "Delete",
        119: "MetaLeft",
        120: "MetaRight",
        121: "ContextMenu",
        122: "Power",
        123: "AudioVolumeMute",
        124: "AudioVolumeDown",
        125: "AudioVolumeUp",
        126: "MediaTrackNext",
        127: "MediaTrackPrevious",
        128: "MediaStop",
        129: "MediaPlayPause",
        130: "LaunchMail",
        131: "MediaSelect",
        132: "LaunchApp1",
        133: "LaunchApp2",
        134: "LaunchApp3",
        135: "LaunchApp4",
        136: "BrowserSearch",
        137: "BrowserHome",
        138: "BrowserBack",
        139: "BrowserForward",
        140: "BrowserStop",
        141: "BrowserRefresh",
        142: "BrowserFavorites",
        143: "Lang3",
        144: "Lang4",
        145: "Lang5",
        146: "Lang6",
        147: "Lang7",
        148: "Lang8",
        149: "Lang9",
        150: "Lang10",
        151: "BrightnessDown",
        152: "BrightnessUp",
        153: "Eject",
        154: "Sleep",
        155: "WakeUp",
        156: "ScreenLock",
        157: "DisplaySwitch",
        158: "KbdIllumToggle",
        159: "KbdIllumDown",
        160: "KbdIllumUp",
        161: "SendMessage",
        162: "Reply",
        163: "Forward",
        164: "Save",
        165: "Documents",
        166: "Pictures",
        167: "Music",
        168: "Movies",
        169: "Calendar",
        170: "Calculator",
        171: "Memo",
        172: "ToDoList",
        173: "Phone",
        174: "Voicemail",
        175: "Contacts",
        176: "Mail",
        177: "MediaLibrary",
        178: "Search",
        179: "HomePage",
        180: "LogOff",
        181: "LockScreen",
        182: "TaskManager",
        183: "Next",
        184: "Previous",
        185: "EndCall",
        186: "AnswerCall",
        187: "MuteCall",
        188: "HoldCall",
        189: "ConferenceCall",
        190: "VolumeUp",
        191: "VolumeDown",
        192: "ZoomIn",
        193: "ZoomOut",
        194: "ScrollUp",
        195: "ScrollDown",
        196: "RotateLeft",
        197: "RotateRight",
        198: "FlipHorizontal",
        199: "FlipVertical",
        200: "Mirror",
        201: "PictureInPicture",
        202: "PictureMode",
        203: "ScreenShare",
        204: "VideoCall",
        205: "VoiceSearch",
        206: "AssistiveTouch",
        207: "Dictate",
        208: "LanguageSwitch",
        209: "Accessibility",
        210: "InputMethod",
        211: "EmojiPicker",
        212: "Camera",
        213: "PhotoLibrary",
        214: "FaceUnlock",
        215: "FingerprintScan",
        216: "IrisScan",
        217: "SmartLock",
        218: "DoNotDisturb",
        219: "NightMode",
        220: "PrivacyMode",
        221: "FlightMode",
        222: "PowerOff",
        223: "Restart",
        224: "Shutdown",
        225: "Hibernate",
        226: "RestartToBootloader",
        227: "SafeMode",
        228: "DeveloperOptions",
        229: "TakeScreenshot",
        230: "RecordScreen",
        231: "VideoPlayback",
        232: "MediaPause",
        233: "MediaRewind",
        234: "MediaFastForward",
        235: "MediaPlay",
        236: "MediaStop",
        237: "MediaRecord",
        238: "PlayPause",
        239: "PlayStop",
        240: "MediaNext"
      }`;
    this.output += `
    let currentTimer = Date.now();
  let Ink = "black";
  let Timer = 0;
  let currentPressedKey = null;
  let isPressed = false;
 const keyCodes = () => {
  document.addEventListener('keydown', function (e) {

    isPressed = true;
    currentPressedKey = e.code;
  });
  document.addEventListener('keyup', function (e) {
    isPressed = false;
    currentPressedKey = null;
});
};

keyCodes();
  `;
    this.output += `
  function clearDivs(idtarget) {
  const screenDiv = document.getElementById(idtarget);
  if (screenDiv) {
 screenDiv.remove(); 

  }
}
  let soundPlayerTimeTracker = 0;
const pitchToFrequency = {
    1: 16.35,   // C0
    2: 17.32,   // C#0
    3: 18.35,   // D0
    4: 19.45,   // D#0
    5: 20.60,   // E0
    6: 21.83,   // F0
    7: 23.12,   // F#0
    8: 24.50,   // G0
    9: 25.96,   // G#0
   10: 27.50,   // A0
   11: 29.14,   // A#0
   12: 30.87,   // B0
   13: 32.70,   // C1
   14: 34.65,   // C#1
   15: 36.71,   // D1
   16: 38.89,   // D#1
   17: 41.20,   // E1
   18: 43.65,   // F1
   19: 46.25,   // F#1
   20: 49.00,   // G1
   21: 51.91,   // G#1
   22: 55.00,   // A1
   23: 58.27,   // A#1
   24: 61.74,   // B1
   25: 65.41,   // C2
   26: 69.30,   // C#2
   27: 73.42,   // D2
   28: 77.78,   // D#2
   29: 82.41,   // E2
   30: 87.31,   // F2
   31: 92.50,   // F#2
   32: 98.00,   // G2
   33: 103.83,  // G#2
   34: 110.00,  // A2
   35: 116.54,  // A#2
   36: 123.47,  // B2
   37: 130.81,  // C3
   38: 138.59,  // C#3
   39: 146.83,  // D3
   40: 155.56,  // D#3
   41: 164.81,  // E3
   42: 174.61,  // F3
   43: 185.00,  // F#3
   44: 196.00,  // G3
   45: 207.65,  // G#3
   46: 220.00,  // A3
   47: 233.08,  // A#3
   48: 246.94,  // B3
   49: 261.63,  // C4
   50: 277.18,  // C#4
   51: 293.66,  // D4
   52: 311.13,  // D#4
   53: 329.63,  // E4
   54: 349.23,  // F4
   55: 369.99,  // F#4
   56: 392.00,  // G4
   57: 415.30,  // G#4
   58: 440.00,  // A4
   59: 466.16,  // A#4
   60: 493.88,  // B4
   61: 523.25,  // C5
   62: 554.37,  // C#5
   63: 587.33,  // D5
   64: 622.25,  // D#5
   65: 659.25,  // E5
   66: 698.46,  // F5
   67: 739.99,  // F#5
   68: 783.99,  // G5
   69: 830.61,  // G#5
   70: 880.00,  // A5
   71: 932.33,  // A#5
   72: 987.77,  // B5
   73: 1046.50, // C6
   74: 1108.73, // C#6
   75: 1174.66, // D6
   76: 1244.51, // D#6
   77: 1318.51, // E6
   78: 1396.91, // F6
   79: 1479.98, // F#6
   80: 1567.98, // G6
   81: 1661.22, // G#6
   82: 1760.00, // A6
   83: 1864.66, // A#6
   84: 1975.53, // B6
   85: 2093.00, // C7
   86: 2217.46, // C#7
   87: 2349.32, // D7
   88: 2489.02, // D#7
   89: 2637.02, // E7
   90: 2793.83, // F7
   91: 2959.96, // F#7
   92: 3135.96, // G7
   93: 3322.44, // G#7
   94: 3520.00, // A7
   95: 3729.31, // A#7
   96: 3951.07, // B7
};

let activeOscillators = {}; // Object to store active oscillators keyed by noteId

function soundPlayer(noteId, cooldown) {
     let currentTime = Date.now();

    if (currentTime - soundPlayerTimeTracker > cooldown/2) {
        soundPlayerTimeTracker = currentTime;

        const frequency = pitchToFrequency[noteId];

        // Check if there's already an oscillator for this noteId
        if (activeOscillators[noteId]) {
            // Stop the existing oscillator
            activeOscillators[noteId].stop();
            activeOscillators[noteId].disconnect(); // Disconnect it from the audio context
        }

        // Create a new AudioContext for the new oscillator
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Create a GainNode for controlling volume
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime); // Start at zero gain (silent)

        // Create a new oscillator
        const oscillator = audioCtx.createOscillator();

        // Set the frequency of the oscillator
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

        // Create a custom waveform using PeriodicWave
        const real = new Float32Array([0, 1, 0.5, 0.25, 0.125]); // Amplitude of harmonics
        const imag = new Float32Array(real.length); // Zero phase shift
        const customWave = audioCtx.createPeriodicWave(real, imag);

        // Set the custom waveform to the oscillator
        oscillator.setPeriodicWave(customWave);

        // Connect the oscillator to the gain node, then to the audio context's destination (the speakers)
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Resume the AudioContext and start the oscillator
        audioCtx.resume().then(() => {
            // Apply fade-in (linear ramp to full volume over 50ms)
            gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.05);

            // Start the oscillator
            oscillator.start();

            // Schedule the fade-out (linear ramp to zero gain 50ms before the sound stops)
            gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.95);

            // Store the oscillator in the activeOscillators object
            activeOscillators[noteId] = oscillator;

            // Stop the oscillator after 1 second and remove it from the activeOscillators object
            oscillator.stop(audioCtx.currentTime + 1);
            oscillator.onended = () => {
                delete activeOscillators[noteId];
            };
        });
    }
}



// Dictionary to hold file streams based on channels (0-10)
const channels = {};
function randomInt(max) {
const random = Math.floor(Math.random() * (max - 0 + 1)) + 0

  return random}
// Function to open a file and assign it to a channel
function openFile(fileName, channel, mode = 'w') {
console.log(fileName, 'opened on channel', channel); 
  if (channel < 0 || channel > 10) {
    throw new Error('Channel must be between 0 and 10');
  }
  const stream = fs.createWriteStream(fileName, { flags: mode });
  channels[channel] = stream;
  console.log(fileName, 'opened on channel', channel);
}


// Function to write to a file based on the assigned channel
function writeToChannel(channel, data) {
  const stream = channels[channel];
  if (!stream) {
    throw new Error('No file opened on channel', channel);
  }
  stream.write(data + '\\n', 'utf8', (err) => {
    if (err) throw err;
    console.log('Data written to channel', channel);
  });
}
  // Function to read from a file based on the assigned channel
  function readFromChannel(channel, callback) {
    const stream = channels[channel];
    if (!stream || !stream.readable) {
      throw new Error('No readable file opened on channel', channel);
    }
    let data = '';
    stream.on('data', chunk => data += chunk);
    stream.on('end', () => {
      callback(data.trim()); // Callback to return the read data
    });
  }

// Function to close a file channel
  function closeChannel(channel) {
    const stream = channels[channel];
    if (!stream) {
      throw new Error('No file opened on channel', channel);
    }
    stream.end(() => {
      console.log('Channel', channel, 'closed');
    });
    delete channels[channel];
  }


    function Cos(angle) {
    return Math.cos(angle * Math.PI / 180);
}
   


function Sin(angle) {
    return Math.sin(angle * Math.PI / 180);
}

function Tan(angle) {
    return Math.tan(angle * Math.PI / 180);
}
let bankData = {
  1: {
  sprites: [],
  processing: false,
  palette: [],
  },
  2: {
  sprites: [],
  processing: false,
  palette: [],
  },
  3: {
  sprites: [],
  processing: false,
  palette: [],
  },
  4: {
  sprites: [],
  processing: false,
  palette: [],
  },
  5: {
  sprites: [],
  processing: false,
  palette: [],
  },

  }
function loadBank(bankName, bank) {
 let bankFileType = bankName.split('.').pop().toLowerCase();
  bankFileType = bankFileType.replace('"', ''); // Remove any non-alphanumeric characters

  if(bankFileType !== "abk"){
    console.error("Invalid file type. Please select a .abk file."); 
    return;
  }
  
  if(bankData[bank].processing === true){
  
  for(let i = 0; i< 5 ; i++){
        if(bankData[i + 1].processing == false){
     console.log("Bank", i + 1, " is free");
     bank = i + 1; // Set the bank to the first available slot with sprites
     bankData[bank].processing = true;
     break;
            }
   }
   if(bank == 1){
     console.log("Bank slots are full");
     return;
   }
  
  
  }else{
    bankData[bank].processing = true;
  }



  // 1) Try the posted bytes (by id or by a name match)
  let file = (window.__getBankFile && window.__getBankFile(bank, bankName)) || null;

  // 2) Fallback to legacy input (only if you also render inputs inside the iframe)
  if (!file) {
    const findElementId = "bankStored" + bank;
    const inputElement = document.getElementById(findElementId);
    file = inputElement?.files?.[0];
    console.log("Storing bank (legacy input):", inputElement?.id);
  }

  if (!file) {
    console.log("Bank failed to be loaded: No file was selected or posted");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const arrayBuffer = e.target.result; // The result is now an ArrayBuffer
    const buffer = new Uint8Array(arrayBuffer); // Convert to Uint8Array for easier byte manipulation

    let offset = 6; // Adjust the starting offset as per the file format
    const numberExpected = (buffer[4] << 8) | buffer[5]; // Check this is correct
   

    let objectsArray = [];
    
    for (let i = 0; i < numberExpected; i++) {
      const width = (buffer[offset] << 8) | buffer[offset + 1];
      const height = (buffer[offset + 2] << 8) | buffer[offset + 3];
      const depth = (buffer[offset + 4] << 8) | buffer[offset + 5];
      const hotspotX = (buffer[offset + 6] << 8) | buffer[offset + 7];
      const hotspotY = (buffer[offset + 8] << 8) | buffer[offset + 9];

      

      const planarGraphicData = [];
      const dataSize = width * 2 * height * depth; // Ensure this calculation is correct

      for (let j = 0; j < dataSize; j++) {
        planarGraphicData.push(buffer[offset + 10 + j]);
      }

      const objectBuilder = {
        width,
        height,
        depth,
        hotspotX,
        hotspotY,
        planarGraphicData,
      };

      objectsArray.push(objectBuilder);
      offset += 10 + dataSize;
    }

    // Initialize colorPalette to hold 32 colors (64 bytes in total)
    let colorPalette = [];

    // Loop through each pair of bytes in the color palette section (32 colors x 2 bytes)
    for (let k = offset; k < offset + 64; k += 2) {
      const byte1 = buffer[k];
      const byte2 = buffer[k + 1];

      const color1 = (byte1 << 8) | byte2;

      // Extract the red, green, and blue components (4 bits each)
      const red = (color1 >> 8) & 0xF;
      const green = (color1 >> 4) & 0xF;
      const blue = color1 & 0xF;

      // Convert 4-bit values (0-15) to 8-bit values (0-255) by multiplying by 17
      const red8 = (red * 17).toString(16).padStart(2, "0");
      const green8 = (green * 17).toString(16).padStart(2, "0");
      const blue8 = (blue * 17).toString(16).padStart(2, "0");

      // Format as HTML color code #RRGGBB
      const color = '#' + red8 + green8 + blue8;
     
      
      colorPalette.push(color.toUpperCase());
      

    }

    
    
    if(bankData[1].sprites.length > 0){
     
  
    // Merge the new sprites and palette with the existing ones
    bankData[1].sprites = [...bankData[1].sprites, ...objectsArray
    ];
    bankData[1].palette = [...bankData[1].palette, ...colorPalette
    ];
   
    }else {
      console.log("Bank 1 does not exist, creating new bank slot");
    
    bankData[bank].sprites = objectsArray;
    bankData[bank].palette = colorPalette;
    if(bankData[bank].sprites.length > 0){
    console.log("Loaded bank slot:", bank, "with", bankData[bank].sprites.length, "sprites", "and color palette: ", bankData[bank].palette);
    }else{
       console.log('Bank',  bankId, 'failed to be loaded', ' on bank slot:', bank);
    }
        console.log("Bank data updated:", bankData[bank]);
      }
   
  };

  reader.readAsArrayBuffer(file); // Use readAsArrayBuffer for binary data
}
let tries = 0;
function renderSprite(spriteNumber, x, y, bankImgIndex) {
  if(tries > 40){

   console.error("Bank not found or could not be loaded");
   location.reload();
   return;
  }
   if (!bankData[1].sprites[bankImgIndex]) {
    
    tries++;
    setTimeout(() => {
        renderSprite(spriteNumber, x, y, bankImgIndex);
      }, 200);
      
    return;
  }

  let { width, height, depth, planarGraphicData } = bankData[1].sprites[bankImgIndex];
  let colorPalette = bankData[1].palette;
  width = width * 16; // Convert width in 16-bit words to pixels

  const pixels = [];
  const bytesPerRow = width / 8;
  const rowSize = bytesPerRow * depth;

  // Build pixels array with hex color values based on the planar graphic data
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let colorIndex = 0;

      // Build colorIndex by combining bits across planes
      for (let plane = 0; plane < depth; plane++) {
        const byteIndex = y * bytesPerRow + plane * (height * bytesPerRow) + Math.floor(x / 8);
        const bitPos = 7 - (x % 8);
        const bit = (planarGraphicData[byteIndex] >> bitPos) & 1;

        colorIndex |= bit << plane;
      }

      const hexColor = colorPalette[colorIndex];
      pixels.push(hexColor);
    }
  }
 let spriteContainerCheck = document.getElementById("sprite" + spriteNumber);

// If the sprite container already exists, remove it from the DOM
if (spriteContainerCheck) {
  spriteContainerCheck.remove();
}

// Create a container div for the new sprite
const spriteContainer = document.createElement("div");
spriteContainer.style.display = "grid";
spriteContainer.style.gridTemplateColumns = "repeat(" + width + ", 1fr)";
spriteContainer.style.position = "absolute";
spriteContainer.style.left = x + "px";
spriteContainer.style.top = y + "px";
spriteContainer.id = "sprite" + spriteNumber; // Assign the ID for future reference
spriteContainer.style.zIndex = 99999;
// Append the new sprite container to the document body (or a specific parent container)
document.body.appendChild(spriteContainer);

// Continue rendering the sprite's pixels
pixels.forEach((color) => {
  if(color === colorPalette[0]){
  const pixel = document.createElement("div");
  pixel.style.width = "1px";
  pixel.style.height = "1px";
  pixel.style.backgroundColor = "transparent";
  spriteContainer.appendChild(pixel);
  }else{
    const pixel = document.createElement("div");
    pixel.style.width = "1px";
    pixel.style.height = "1px";
    pixel.style.backgroundColor = color;
    spriteContainer.appendChild(pixel);
  }
});


  // Append the container to the document body or a specific container element
  document.getElementById('amos-screen').appendChild(spriteContainer);
}
  `;
  }

  // Helper function to return the current indentation
  indent() {
    return "  ".repeat(this.indentLevel); // Each level indents by two spaces
  }

  /* ADDED A GREY BACKGROUND FOR VISUAL PURPOSE */
  enterScreen_open(ctx) {
    const width = ctx.children[3]?.getText();
    const height = ctx.children[5]?.getText();
    const color = ctx.children[7]?.getText();

    this.output += `
${this.indent()}const screenDiv = document.createElement('div');
${this.indent()}screenDiv.style.width = '${width}px';
${this.indent()}screenDiv.style.height = '${height}px';
${this.indent()}screenDiv.style.border = '1px solid red';
${this.indent()}screenDiv.style.overflow = 'hidden'; 
${this.indent()}screenDiv.style.padding = '0'; 
${this.indent()}screenDiv.style.position = 'relative'; 
${this.indent()}screenDiv.id = 'amos-screen'; 
${this.indent()}screenDiv.style.zIndex = 1;
${this.indent()}document.getElementById('game-container').appendChild(screenDiv);
${this.indent()}document.getElementById('amos-screen').style.backgroundColor = colorMapping[${color}];
        `;
  }
  enterBlitter_fill(ctx) {}

  enterLoadBank(ctx) {
    const fileName = ctx.children[1]?.getText();
    const bankId = ctx.children[3]?.getText();
    if (!bankId) {
      this.output += `
  ${this.indent()}
  ${this.indent()}loadBank('${fileName}', 1);
                  
      `;
    } else {
      this.output += `
  ${this.indent()}
  ${this.indent()}loadBank('${fileName}', ${bankId});
      `;
    }
  }

  enterLoadBankImgToSprite(ctx) {
    const spriteNumber = ctx.children[1]?.getText();
    const x = ctx.children[3]?.getText();
    const y = ctx.children[5]?.getText();
    const bankImgIndex = ctx.children[7]?.getText();
    this.output += `
    renderSprite(${spriteNumber}, ${x}, ${y}, ${bankImgIndex});
    `;
  }

  enterOpen_out_readfile(ctx) {
    const channel = ctx.children[2]?.getText();
    const fileName = ctx.children[4]?.getText();

    this.output += `
${this.indent()}openFile('${fileName}', ${channel}, 'w');
    `;
  }

  enterOpen_in_writefile(ctx) {
    const channel = ctx.children[2]?.getText();
    const fileName = ctx.children[4]?.getText();

    this.output += `
${this.indent()}openFile('${fileName}', ${channel}, 'r');
    `;
  }

  enterInput_variable(ctx) {
    let channel = ctx.children[1]?.getText();
    channel += ctx.children[2]?.getText();

    let variable = ctx.children[4]?.getText();
    variable += ctx.children[5]?.getText();
    this.output += `
    let ${variable} = '';
    readFromChannel(${channel}, (data) => {
      ${variable} = data;
    });
    `;
  }
  enterClose_file(ctx) {
    const channel = ctx.children[1]?.getText();

    this.output += `
${this.indent()}closeChannel(${channel});
    `;
  }

  enterPrint_something(ctx) {
    const printConfig = ctx.print_options(0)?.getText();
    if (printConfig.includes("#")) {
      /* WRITE TO FILE */
      let channel = ctx.print_options(0)?.getText();
      let content = ctx.print_options(1)?.getText();
      this.output += `writeToChannel(${channel}, ${content});`;
      return;
    }
    for (let i = 0; i < ctx.print_options().length; i++) {
      let text = ctx.print_options(i)?.getText();

      console.log(typeof text);
      if (!text.includes('"')) {
        text = ctx
          .print_options(i)
          ?.expression1(0)
          ?.getText()
          .replace(/["']/g, "");
        this.output += `
      ${this.indent()}  const finder_printDiv${i} = document.getElementById('printDiv${i}' + '${text}');
       ${this.indent()} if(finder_printDiv${i}){finder_printDiv${i}.remove();}
  ${this.indent()}const printDiv${i} = document.createElement('div');
  ${this.indent()}printDiv${i}.innerText = ${text};
  ${this.indent()}printDiv${i}.style.position = 'relative';
  ${this.indent()}printDiv${i}.style.left = '50%';
  ${this.indent()}printDiv${i}.style.top = '50%';
  ${this.indent()}printDiv${i}.style.fontSize = '14px';
  ${this.indent()}printDiv${i}.style.color = Ink;
    ${this.indent()}printDiv${i}.style.zIndex = "999";
  ${this.indent()}printDiv${i}.id = 'printDiv${i}' + '${text}';
  ${this.indent()}document.getElementById('amos-screen').appendChild(printDiv${i});
  `;
      } else {
        this.output += `
         ${this.indent()}  const finder_printDiv${i} = document.getElementById('printDiv${i}' + '${text}');
       ${this.indent()} if(finder_printDiv${i}){finder_printDiv${i}.remove();}
        ${this.indent()}const printDiv${i} = document.createElement('div');
        ${this.indent()}printDiv${i}.innerText = ${text};
        ${this.indent()}printDiv${i}.style.position = 'relative';
        ${this.indent()}printDiv${i}.style.left = '50%';
        ${this.indent()}printDiv${i}.style.top = '50%';
        ${this.indent()}printDiv${i}.style.fontSize = '14px';
        ${this.indent()}printDiv${i}.style.color = Ink;
            ${this.indent()}printDiv${i}.style.zIndex = "999";
          ${this.indent()}printDiv${i}.id = 'printDiv${i}' + '${text}';
        ${this.indent()}document.getElementById('amos-screen').appendChild(printDiv${i});
        `;
      }
    }
  }

  enterCurs_off(ctx) {
    this.output += `
${this.indent()}document.getElementById('amos-screen').style.cursor = 'none';   
        `;
  }

  enterCurs_on(ctx) {
    this.output += `
${this.indent()}document.getElementById('amos-screen').style.cursor = 'auto';
        `;
  }

  enterPlay_sound(ctx) {
    const soundIndex = ctx.children[1]?.getText();
    const duration = ctx.children[3]?.getText();

    this.output += `
${this.indent()}soundPlayer(${soundIndex}, ${duration}*1000);
        `;
  }

  enterInk(ctx) {
    const colorIndex = ctx.children[1]?.getText();

    const color = this.colorMapping[colorIndex] || "black";
    this.current_Ink = color;
    this.output += `Ink = "${color}";`;
  }
  enterPalette(ctx) {
    // Array to collect complete hex color values from the Palette
    const hexColors = [];
    let currentHex = "";

    // Loop through each child in `ctx` to gather colors
    for (const child of ctx.children) {
      const text = child.getText().trim();

      if (text === "$") {
        // Start of a new hex color, initialize currentHex
        currentHex = "$";
      } else if (text === ",") {
        // End of a hex color, parse it if currentHex has a complete hex value
        if (currentHex.length > 1) {
          hexColors.push(currentHex);
          currentHex = ""; // Reset for the next hex color
        }
      } else {
        // Append hex digits to currentHex
        currentHex += text;
      }
    }

    // Handle the last hex color if there's no trailing comma
    if (currentHex.length > 1) {
      hexColors.push(currentHex);
    }

    // Convert and map hex colors
    this.colorMapping = {};
    hexColors.forEach((hex, index) => {
      const hexValue = parseInt(hex.slice(1), 16); // Remove '$' and parse as hex

      // Extract R, G, B components
      const red = ((hexValue >> 8) & 0xf) * 17;
      const green = ((hexValue >> 4) & 0xf) * 17;
      const blue = (hexValue & 0xf) * 17;

      // Map color in `rgb` format
      this.colorMapping[index + 1] = `rgb(${red}, ${green}, ${blue})`;
    });
    this.pallette = `const colorMapping = ${JSON.stringify(
      this.colorMapping,
      null,
      2
    )};`;
  }

  enterTurbo_draw(ctx) {
    function generateRandomID() {
      let characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let id = "";
      for (let i = 0; i < 9; i++) {
        let randomIndex = Math.floor(Math.random() * characters.length);
        id += characters[randomIndex];
      }
      return id;
    }

    let x1 = ctx.expression1(0)?.getText();
    let y1 = ctx.expression1(1)?.getText();
    let x2 = ctx.expression1(2)?.getText();
    let y2 = ctx.expression1(3)?.getText();
    let color = `colorMapping[${ctx.expression1(4)?.getText()}]`;
    let the_ID = generateRandomID();
    let index = ctx.expression1(5)?.getText();

    // Calculate the length and angle of the line

    this.output += `
    // Calculate the length and angle of the line
    
    const TurboDrawX1${the_ID} = ${x1};
    const TurboDrawX2${the_ID} = ${x2};
    const TurboDrawY1${the_ID} = ${y1};
    const TurboDrawY2${the_ID} = ${y2};
    const idBar${the_ID} = "TurboDraw" + "${the_ID}";
    
    let lineDiv${the_ID} = document.getElementById(idBar${the_ID});

    const deltaX${the_ID} = TurboDrawX2${the_ID} - TurboDrawX1${the_ID};
    const deltaY${the_ID} = TurboDrawY2${the_ID} - TurboDrawY1${the_ID};
    const length${the_ID} = Math.sqrt(deltaX${the_ID} * deltaX${the_ID} + deltaY${the_ID} * deltaY${the_ID}); // Pythagorean theorem
    const angle${the_ID} = Math.atan2(deltaY${the_ID}, deltaX${the_ID}) * (180 / Math.PI); // Convert angle to degrees

    if (lineDiv${the_ID}) {
        // If the div exists, update its properties
        lineDiv${the_ID}.style.backgroundColor = ${color};
        lineDiv${the_ID}.style.left = TurboDrawX1${the_ID} + 'px';
        lineDiv${the_ID}.style.top = TurboDrawY1${the_ID} + 'px';
        lineDiv${the_ID}.style.width = length${the_ID} + 'px';
        lineDiv${the_ID}.style.height = '2px'; // Line height
        lineDiv${the_ID}.style.transform = 'rotate(' + angle${the_ID} + 'deg)';
        lineDiv${the_ID}.style.transformOrigin = '0 0'; // Rotate from the starting point
        lineDiv${the_ID}.style.position = 'absolute';
        lineDiv${the_ID}.style.borderRadius = '1px';
        lineDiv${the_ID}.style.borderColor = ${color};
        lineDiv${the_ID}.style.zIndex = 1000${index};
         lineDiv${the_ID}.indexPlacer = 1000${index};
    } else {
        // If the div doesn't exist, create it
        lineDiv${the_ID} = document.createElement('div');
        lineDiv${the_ID}.style.position = 'absolute';
        lineDiv${the_ID}.id = idBar${the_ID};
        lineDiv${the_ID}.style.backgroundColor = ${color};
        lineDiv${the_ID}.style.left = TurboDrawX1${the_ID} + 'px';
        lineDiv${the_ID}.style.top = TurboDrawY1${the_ID} + 'px';
        lineDiv${the_ID}.style.width = length${the_ID} + 'px';
        lineDiv${the_ID}.style.height = '2px'; // Line height
        lineDiv${the_ID}.style.transform = 'rotate(' + angle${the_ID} + 'deg)';
        lineDiv${the_ID}.style.transformOrigin = '0 0'; // Rotate from the starting point
        lineDiv${the_ID}.style.borderRadius = '1px';
        lineDiv${the_ID}.style.borderColor = ${color};
        lineDiv${the_ID}.style.zIndex = 1000${index};
    lineDiv${the_ID}.indexPlacer = 1000${index};
        document.getElementById('amos-screen').appendChild(lineDiv${the_ID});
    }

    `;
  }

  enterBar(ctx) {
    const x1 = ctx.expression1(0).getText();
    const y1 = ctx.expression2(0).getText();
    const x2 = ctx.expression1(1).getText();
    const y2 = ctx.expression2(1).getText();

    // Gere um ID seguro e único baseado nas coordenadas
    const idBar = `"Bar_" + (${x1}) + "_" + (${y1})`;

    this.output += `
    const idBar = ${idBar};
    const x1 = ${x1};
    const y1 = ${y1};
    const x2 = ${x2};
    const y2 = ${y2};
    const width = x2 - x1;
    const height = y2 - y1;

    let screenBarDiv = document.getElementById(idBar);

    if (!screenBarDiv) {
        screenBarDiv = document.createElement('div');
        screenBarDiv.id = idBar;
        screenBarDiv.style.position = 'absolute';
        screenBarDiv.style.boxSizing = 'border-box';
        document.getElementById('amos-screen').appendChild(screenBarDiv);
    }

    screenBarDiv.style.backgroundColor = Ink;
    screenBarDiv.style.left = x1 + 'px';
    screenBarDiv.style.top = y1 + 'px';
    screenBarDiv.style.width = width + 'px';
    screenBarDiv.style.height = height + 'px';
    screenBarDiv.style.zIndex = 10;
  `;
  }

  enterBox(ctx) {
    const x1 = ctx.expression1(0).getText();
    const y1 = ctx.expression1(1).getText();
    const x2 = ctx.expression1(2).getText();
    const y2 = ctx.expression1(3).getText();

    const boxID = `"Box_" + ${x1} + "_" + ${y1} + "_" + ${x2} + "_" + ${y2}`;

    this.output += `
    const idBox = ${boxID};
    let boxDiv = document.getElementById(idBox);
    if (!boxDiv) {
      boxDiv = document.createElement('div');
      boxDiv.id = idBox;
      boxDiv.style.position = 'absolute';
      boxDiv.style.boxSizing = 'border-box';
      document.getElementById('amos-screen').appendChild(boxDiv);
      }
    boxDiv.style.border = '2px solid ' + Ink;
    boxDiv.style.left = (${x1}) + "px";
    boxDiv.style.top = (${y1}) + "px";
    boxDiv.style.width = (${x2} - ${x1}) + "px";
    boxDiv.style.height = (${y2} - ${y1}) + "px";
    boxDiv.style.zIndex = 10;
  `;
  }

  enterCircle(ctx) {
    const x = ctx.expression1(0).getText();
    const y = ctx.expression1(1).getText();
    const r = ctx.expression1(2).getText();
    const circleID = `"Circle_" + (${x}) + "_" + (${y}) + "_" + (${r})`;

    this.output += `
    const circleId = ${circleID};
    let circleDiv = document.getElementById(circleId);
    if (!circleDiv) {
      circleDiv = document.createElement('div');
      circleDiv.id = circleId;
      circleDiv.style.position = 'absolute';
      circleDiv.style.boxSizing = 'border-box';
      document.getElementById('amos-screen').appendChild(circleDiv);
      }
    circleDiv.style.borderRadius = '50%';
    circleDiv.style.border = '2px solid ' + Ink;
    circleDiv.style.left = (${x} - ${r}) + 'px';
    circleDiv.style.top = (${y} - ${r}) + 'px';
    circleDiv.style.width = (${r} * 2) + 'px';
    circleDiv.style.height = (${r} * 2) + 'px';
    circleDiv.style.zIndex = 10;
    circleDiv.style.backgroundColor = Ink; 
  `;
  }

  /* WHILE for key pressed */
  enterWhile_wend(ctx) {
    let leftExpression = ctx.current_Key_State(0)?.expression1(0)?.getText();
    if (!leftExpression) return;

    // Replace all occurrences of $xx with decimal equivalents
    leftExpression = leftExpression.replace(/\$[0-9A-Fa-f]+/g, (match) => {
      return parseInt(match.substring(1), 16);
    });

    this.output += `\n${this.indent()}if (currentPressedKey === keyMapping[${leftExpression}]) {\n`;
  }
  enterWait_key(ctx) {
    const waitTime = ctx.NUMBER().getText();
    const ms = parseInt(waitTime) * 20; // 20ms por tick
    this.output += `${this.indent()}await new Promise(resolve => setTimeout(resolve, ${ms}));\n`;
  }

  exitWhile_wend(ctx) {
    this.output += `
${this.indent()}}`;
  }
  enterVariable_starter(ctx) {
    let name = ctx.children[0]?.getText() || "";
    let value = ctx.children[2]?.getText() || 0;

    let lineNumber = ctx.start.line;
    if (name !== "Timer") {
      if (value > 2147483647) {
        throw new Error(
          `ERROR: Amos code line ${lineNumber}: Value for variable "${name}" exceeds the allowed limit of 2,147,483,647.`
        );
      }

      if (this.variables[name]) {
        // Iterate over all terms and factors in expression1
        for (let j = 0; ctx.expression1(0)?.term(j); j++) {
          for (let i = 0; ctx.expression1(0)?.term(j)?.factor(i); i++) {
            let arrayIndexGet = ctx
              .expression1(0)
              ?.term(j)
              ?.factor(i)
              ?.array_index_get(0);
            if (arrayIndexGet) {
              // Get the text and replace parentheses with square brackets
              let text = arrayIndexGet.getText();
              let modifiedText = text.replace(/\(/g, "[").replace(/\)/g, "]");
              value = value.replace(text, modifiedText);
            }
          }
        }

        // Variable already exists at this indent level
        this.output += `
     ${this.indent()}${name} = ${value};
          `;
      } else {
        for (let j = 0; ctx.expression1(0)?.term(j); j++) {
          for (let i = 0; ctx.expression1(0)?.term(j)?.factor(i); i++) {
            let arrayIndexGet = ctx
              .expression1(0)
              ?.term(j)
              ?.factor(i)
              ?.array_index_get(0);
            if (arrayIndexGet) {
              // Get the text and replace parentheses with square brackets
              let text = arrayIndexGet.getText();
              let modifiedText = text.replace(/\(/g, "[").replace(/\)/g, "]");
              value = value.replace(text, modifiedText);
            }
          }
        }
        // Variable doesn't exist at this indent level, so create it
        value = value.replace(/\bRnd\s*\(([^)]+)\)/g, "randomInt($1)");
        this.output += `
        ${this.indent()}let ${name} = ${value};
          `;
        // Store the variable in the current indent level
        this.variables[name] = value;
      }
    }
  }
  enterAdd(ctx) {
    let variable = ctx.children[1]?.getText();
    let valueExpression = ctx.children[3]?.getText();

    let valueStarter;
    let valueEndIteration;
    if (
      !this.variables[variable] &&
      !this.globalVariables.includes(`let ${variable}`)
    ) {
      this.variables[variable] = 0;
      this.globalVariables += `${this.indent()}let ${variable} = 0;`;
    }

    if (ctx.children.length > 4) {
      valueStarter = ctx.children[5]?.getText();
      valueEndIteration = ctx.children[7]?.getText();

      this.output += `
    ${this.indent()}${variable} = (${variable} + ${valueExpression}) % ${valueEndIteration};
    ${this.indent()}if (${variable} < ${valueStarter}) {
      ${this.indent()}${variable} += ${valueEndIteration};
    }
    `;
    } else {
      this.output += `
    ${this.indent()}${variable} = ${variable} + ${valueExpression};
    `;
    }
  }

  enterProcedure(ctx) {
    this.id++;
    let name = ctx.children[1]?.getText();
    let props = "";
    if (ctx.IDENTIFIER(1)) {
      for (let i = 3; i < ctx.children.length; i++) {
        if (ctx.children[i]?.getText() === "]") {
          break;
        }
        props += ctx.children[i]?.getText();
        if (ctx.children[i + 1]?.getText() !== "]") {
          props += " ";
          props += ",";
        }
      }
    } else {
    }

    this.output += `
    let lastTime${name} = 0; 
    let timeoutId${name} = null; // Track the timeout ID
${this.indent()}const ${name} = (${props}) => {
  const currentTime = Date.now();
  const timeSinceLastCall = currentTime - lastTime${name};
  
  if (timeSinceLastCall < 16) {
    if (timeoutId${name}) clearTimeout(timeoutId${name}); // Clear any existing timeout
    timeoutId${name} = setTimeout(() => {
      ${name}(${props}); 
    }, 100 - timeSinceLastCall);
    return;
  }

  lastTime${name} = currentTime;
  timeoutId${name} = null; // Clear the timeout ID after execution
        `;
    this.indentLevel++;
  }

  exitProcedure(ctx) {
    this.indentLevel--;
    this.output += `
${this.indent()}}\n`;
  }

  enterText(ctx) {
    const x = ctx.children[1]?.getText();
    const y = ctx.children[3]?.getText();
    const text = ctx.children[5]?.getText();
    if (!text.includes('"')) {
      this.output += `
       
${this.indent()}const textDiv${x}${y} = document.createElement('div');
${this.indent()}textDiv${x}${y}.innerText = ${text};
${this.indent()}textDiv${x}${y}.id = 'textDiv' + '${x}' + '${y}';
${this.indent()}textDiv${x}${y}.style.position = 'fixed';
${this.indent()}textDiv${x}${y}.style.left = '${x}px';
${this.indent()}textDiv${x}${y}.style.top = '${y}px';
${this.indent()}textDiv${x}${y}.style.fontSize = '14px';
${this.indent()}textDiv${x}${y}.style.color = Ink;

${this.indent()}textDiv${x}${y}.style.zIndex = 99;
${this.indent()}document.getElementById('amos-screen').appendChild(textDiv${x}${y});
      setInterval(() => {
  textDiv${x}${y}.innerText = ${text}; // Function that returns updated value
}, 100); 
        `;
    } else {
      this.output += `
${this.indent()}const textDiv${x}${y} = document.createElement('div');
${this.indent()}textDiv${x}${y}.innerText = '${text.replace(/"/g, "")}';
${this.indent()}textDiv${x}${y}.id = 'textDiv' + '${x}' + '${y}';
${this.indent()}textDiv${x}${y}.style.position = 'absolute';
${this.indent()}textDiv${x}${y}.style.left = '${x}px';
${this.indent()}textDiv${x}${y}.style.top = '${y}px';
${this.indent()}textDiv${x}${y}.style.fontSize = '14px';
${this.indent()}textDiv${x}${y}.style.color = Ink;
${this.indent()}textDiv${x}${y}.style.position = "Relative";
${this.indent()}textDiv${x}${y}.style.zIndex = 99;
${this.indent()}document.getElementById('amos-screen').appendChild(textDiv${x}${y});
        `;
    }
  }
  enterWait_key(ctx) {
    const waitTicks = ctx.NUMBER().getText();
    const ms = parseInt(waitTicks) * 20; // AMOS = ~50fps

    this.output += `
${this.indent()}allowLoop = false;
${this.indent()}setTimeout(() => {
${this.indent(1)}allowLoop = true;
${this.indent()}}, ${ms});\n`;
  }

  // Handle DO loop
  enterDo_loop(ctx) {
    this.output += `
let allowLoop = true; // Controla o loop para Wait funcionar

${this.indent()}setInterval(() => {
  if (!allowLoop) return;

  currentTimer = Date.now();
  Timer++;\n`;
    this.indentLevel++;
  }

  enterRepeat_key(ctx) {
    this.output += `
${this.indent()}setInterval(() => {
  currentTimer = Date.now();
  Timer++;

        `;
    this.indentLevel++; // Increase indentation inside the loop
  }
  exitRepeat_key(ctx) {
    this.indentLevel--; // Decrease indentation after exiting the loop
    this.output += `
    
    
    Timer = 9;
  
${this.indent()}}, 16);`;
  }
  exitDo_loop(ctx) {
    this.indentLevel--; // Decrease indentation after exiting the loop
    this.output += `
    
    
    Timer = 9;
  
${this.indent()}}, 16); \n
`;
  }

  enterFor_loop(ctx) {
    let variable;
    let start;
    let end;
    variable = ctx.children[1]?.getText();
    start = ctx.children[3]?.getText();
    end = ctx.children[5]?.getText();

    this.output += `${this.indent()}for (let ${variable} = ${start}; ${variable} <= ${end}; ${variable}++) {`;
    this.indentLevel++; // Increase indentation inside the loop
  }

  enterIf_then(ctx) {
    let expressions1 = [];
    let expressions2 = [];
    let comparators = [];
    let or_and = [];
    for (let i = 0; i < ctx.expression1().length; i++) {
      expressions1.push(ctx.expression1(i).getText());
    }
    for (let i = 0; i < ctx.expression2().length; i++) {
      expressions2.push(ctx.expression2(i).getText());
    }
    for (let i = 0; i < ctx.expressions_comparators().length; i++) {
      comparators.push(ctx.expressions_comparators(i).getText());
    }
    for (let i = 0; i < ctx.or_and().length; i++) {
      or_and.push(ctx.or_and(i).getText());
    }

    let finalIfStatement = "";

    for (let i = 0; i < expressions1.length; i++) {
      finalIfStatement +=
        expressions1[i] + " " + comparators[i] + " " + expressions2[i];
      if (or_and[i] && or_and[i] === "AND") {
        finalIfStatement += " && ";
      }
      if (or_and[i] && or_and[i] === "OR") {
        finalIfStatement += " || ";
      }
    }

    console.log(finalIfStatement);
  }

enterArray_create(ctx) {
  for (let i = 0; i < ctx.array_structure().length; i++) {
    const struct = ctx.array_structure(i);
    const name = struct.IDENTIFIER(0)?.getText();

    // Check if we have 2 dimensions (either NUMBER or expression1)
    const hasTwoDimensions = 
      struct.NUMBER().length > 1 || 
      struct.expression1().length > 1;

    if (hasTwoDimensions) {
      // Get dimensions (could be numbers or variables)
      const dim0 = struct.NUMBER(0)?.getText() || 
                   struct.expression1(0)?.getText() || 
                   "0";
      const dim1 = struct.NUMBER(1)?.getText() || 
                   struct.expression1(1)?.getText();

      if (dim1) {
        // 2D Matrix - need to add 1 to dimensions
        // Check if dimensions are numeric literals or variables
        const xSize = struct.NUMBER(0) ? `${parseInt(dim0) + 1}` : `(${dim0} + 1)`;
        const ySize = struct.NUMBER(1) ? `${parseInt(dim1) + 1}` : `(${dim1} + 1)`;

        this.output += `${this.indent()}const ${name} = new Array(${ySize});\n`;
        this.output += `${this.indent()}for (let i = 0; i < ${ySize}; i++) ${name}[i] = new Array(${xSize});\n`;
      } else {
        // 1D Array
        const size = struct.NUMBER(0) ? `${parseInt(dim0) + 1}` : `(${dim0} + 1)`;
        this.output += `${this.indent()}const ${name} = new Array(${size});\n`;
      }
    } else {
      // Single dimension array
      const dim0 = struct.NUMBER(0)?.getText() || 
                   struct.expression1(0)?.getText() || 
                   "0";
      const size = struct.NUMBER(0) ? `${parseInt(dim0) + 1}` : `(${dim0} + 1)`;
      this.output += `${this.indent()}const ${name} = new Array(${size});\n`;
    }
  }
}
  exitFor_loop(ctx) {
    this.indentLevel--; // Decrease indentation after exiting the loop
    this.output += `${this.indent()}}`;
  }
  enterData_statement(ctx) {
    if (!this.dataMatrix) {
      this.dataMatrix = [];
      this.output += `${this.indent()}const dataMatrix = [];\n`;
    }

    const values = ctx.expression1().map((e) => e.getText());
    const row = `[${values.join(", ")}]`;
    this.dataMatrix.push(row);
    this.output += `${this.indent()}dataMatrix.push(${row});\n`;
  }

  enterRead_statement(ctx) {
    function convertAMOSArrayAccess(text) {
      const match = text.match(
        /^(\w+)\s*\(\s*([^\s,]+)\s*,\s*([^\s,)]+)\s*\)$/
      );
      if (match) {
        const [, name, x, y] = match;
        return { name, x, y };
      }
      return null;
    }

    const targets = ctx.children.filter(
      (child) => child.getText() !== "Read" && child.getText() !== ","
    );

    for (let i = 0; i < targets.length; i++) {
      const rawText = targets[i].getText();
      const access = convertAMOSArrayAccess(rawText);

      if (access) {
        const { name, x, y } = access;
        this.output += `${this.indent()}${name}[${y}][${x}] = dataMatrix[${y}][${x}];\n`;
      } else {
        this.output += `${this.indent()}${rawText} = dataMatrix[0][${i}];\n`;
      }
    }
  }

 enterArray_update(ctx) {
  const arrayName = ctx.IDENTIFIER(0)?.getText();
  
  // Get the first index (can be NUMBER, IDENTIFIER, or expression1)
  let index1 = ctx.NUMBER(0)?.getText() || 
               ctx.IDENTIFIER(1)?.getText() || 
               ctx.expression1(0)?.getText();
  
  // Check if there's a second index (for 2D arrays)
  let index2 = null;
  if (ctx.COMMA()) {
    // There's a comma, so we have a second dimension
    index2 = ctx.NUMBER(1)?.getText() || 
             ctx.IDENTIFIER(2)?.getText() || 
             ctx.expression1(1)?.getText();
  }
  
  // Get the value to assign
  let arrayTargetValue;
  if (index2) {
    // 2D array: value is at expression1(2)
    arrayTargetValue = ctx.expression1(2)?.getText();
  } else {
    // 1D array: value is at expression1(1) or expression1(0)
    arrayTargetValue = ctx.expression1(1)?.getText() || ctx.expression1(0)?.getText();
  }

  // Check for Qcos or Qsin and process the scaling
  if (arrayTargetValue && (arrayTargetValue.includes("Qcos") || arrayTargetValue.includes("Qsin"))) {
    const match = arrayTargetValue.match(/(Qcos|Qsin)\(([^,]+),([^)]+)\)/);
    if (match) {
      const funcName = match[1];
      const angle = match[2].trim();
      const scale = match[3].trim();
      const trigFunction = funcName === "Qcos" ? "Cos" : "Sin";
      arrayTargetValue = `${trigFunction}(${angle}) * ${scale}`;
    }
  }

  // Generate the appropriate JavaScript based on 1D or 2D
  if (index2) {
    // 2D array assignment: arrayName[index2][index1] = value
    this.output += `${this.indent()}${arrayName}[${index2}][${index1}] = ${arrayTargetValue};\n`;
  } else {
    // 1D array assignment: arrayName[index1] = value
    this.output += `${this.indent()}${arrayName}[${index1}] = ${arrayTargetValue};\n`;
  }
}

  enterIf_statement(ctx) {
    function convertAMOSArrayAccess(text) {
      const match = text.match(
        /^(\w+)\s*\(\s*([^\s,]+)\s*,\s*([^\s,)]+)\s*\)$/
      );
      if (match) {
        const [, name, x, y] = match;
        return { name, x, y };
      }
      return null;
    }

    function convertAMOSArrayAccessSimple(text) {
      //format is <name>(<x>)

      const match = text.match(/^(.*?)\s*\(\s*([^\s,]+)\s*\)$/);
      if (match) {
        const [, name, x] = match;

        return { name, x };
      }
      return null;
    }
    let leftExpression;
    let comparator;
    let rightExpression = "";

    // Get the left-hand side expression (e.g., PRESSEDKEYNUMBER)
    leftExpression = ctx.expression1(0)?.getText();

    // Get the comparison operator (e.g., =, <>)
    comparator = ctx.children[2]?.getText();
    if (comparator === "=") {
      comparator = "==";
    }
    if (comparator === "<>") {
      comparator = "!=";
    }

    // This below is for matrix, array[x][y]

    if (!leftExpression) {
      const array = convertAMOSArrayAccess(ctx.read_target(0)?.getText());
      const { name, x, y } = array;
      leftExpression = `${this.indent()}${name}[${y}][${x}]`;
    }

    // And this is for usual array

    if (
      leftExpression &&
      ctx.expression1(0)?.term(0)?.factor(0)?.array_index_get(0)?.getText()
    ) {
      const array = convertAMOSArrayAccessSimple(
        ctx.expression1(0)?.term(0)?.factor(0)?.array_index_get(0)?.getText()
      );

      const { name, x } = array;
      leftExpression = `${this.indent()}${name}[${x}]`;
    }
    // Get the right-hand side expression (e.g., 2 * I + 1)
    rightExpression = ctx.expression2(0)?.getText();

    // Output the if statement
    this.output += `
    
${this.indent()}if (${leftExpression} ${comparator} ${rightExpression}) {
        `;
    this.indentLevel++; // Increase indentation for nested blocks
  }

  exitIf_statement(ctx) {
    this.indentLevel--; // Decrease indentation after exiting the if block
    this.output += `
${this.indent()}}`;
  }

  enterFunction_starter(ctx) {
    let name = ctx.children[0]?.getText() || "";
    let value = ctx.children[2]?.getText() || 0;
    if (this.indentLevel == 0) {
      this.functionStarters += `
  ${this.indent()}${name}(${value}); // Function call
          `;
    } else {
      this.output += `
  ${this.indent()}${name}(${value}); // Function call
          `;
    }
  }
  enterIf_statement_key_state(ctx) {
    let leftExpression = ctx.current_Key_State(0)?.expression1(0)?.getText();

    if (leftExpression.includes("$")) {
      // Extract the hexadecimal value from the expression
      let hexValueMatch = leftExpression.match(/\$[0-9A-Fa-f]+/);

      if (hexValueMatch) {
        let hexValue = parseInt(hexValueMatch[0].replace("$", ""), 16);

        // Check if the leftExpression is just a hexadecimal value
        if (hexValueMatch[0] === leftExpression) {
          // If it's only a hex value, convert it to a key mapping lookup
          leftExpression = `keyMapping[${hexValue}`;
        } else {
          let variable = leftExpression.split("$")[0];

          // If it's a variable or expression with a hex part, construct it accordingly
          leftExpression = leftExpression.replace(
            /\$[0-9A-Fa-f]+/,
            `keyMapping[${hexValue}`
          );
        }
      }
    }

    this.output += `
    
${this.indent()}if (currentPressedKey === ${leftExpression}]) {
   

  `;
    this.indentLevel++; // Increase indentation for nested blocks
  }

  exitIf_statement_key_state(ctx) {
    this.indentLevel--; // Decrease indentation after exiting the if block
    this.output += `
${this.indent()}
}`;
  }

  enterElse_statement(ctx) {
    this.output += `}else {`;
    this.indentLevel++;
  }
  exitElse_statement(ctx) {
    this.indentLevel--;
    this.output += ``;
  }
  getJavaScript() {
    return (
      this.imports +
      this.pallette +
      this.globalVariables +
      this.output +
      this.functionStarters
    );
  }
}

export default AmosToJavaScriptTranslator;
