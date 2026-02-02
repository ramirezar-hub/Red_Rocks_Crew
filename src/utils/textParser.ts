import { ParsedMessage, ParsedPick } from '../types';

// Common NCAA basketball team names and abbreviations
const TEAM_PATTERNS: { [key: string]: string } = {
  // Top seeds and common tournament teams
  'uconn': 'UConn',
  'connecticut': 'UConn',
  'huskies': 'UConn',
  'purdue': 'Purdue',
  'boilermakers': 'Purdue',
  'houston': 'Houston',
  'cougars': 'Houston',
  'tennessee': 'Tennessee',
  'vols': 'Tennessee',
  'volunteers': 'Tennessee',
  'duke': 'Duke',
  'blue devils': 'Duke',
  'auburn': 'Auburn',
  'tigers': 'Auburn',
  'iowa state': 'Iowa State',
  'cyclones': 'Iowa State',
  'marquette': 'Marquette',
  'golden eagles': 'Marquette',
  'kentucky': 'Kentucky',
  'kentucky wildcats': 'Kentucky',
  'uk': 'Kentucky',
  'kansas': 'Kansas',
  'jayhawks': 'Kansas',
  'ku': 'Kansas',
  'arizona': 'Arizona',
  'arizona wildcats': 'Arizona',
  'baylor': 'Baylor',
  'bears': 'Baylor',
  'creighton': 'Creighton',
  'bluejays': 'Creighton',
  'north carolina': 'North Carolina',
  'unc': 'North Carolina',
  'tar heels': 'North Carolina',
  'tarheels': 'North Carolina',
  'gonzaga': 'Gonzaga',
  'zags': 'Gonzaga',
  'alabama': 'Alabama',
  'bama': 'Alabama',
  'crimson tide': 'Alabama',
  'illinois': 'Illinois',
  'illini': 'Illinois',
  'wisconsin': 'Wisconsin',
  'badgers': 'Wisconsin',
  'florida': 'Florida',
  'gators': 'Florida',
  'michigan state': 'Michigan State',
  'msu': 'Michigan State',
  'spartans': 'Michigan State',
  'texas': 'Texas',
  'longhorns': 'Texas',
  'villanova': 'Villanova',
  'nova': 'Villanova',
  'san diego state': 'San Diego State',
  'sdsu': 'San Diego State',
  'aztecs': 'San Diego State',
  'yale': 'Yale',
  'bulldogs': 'Yale',
  'colorado state': 'Colorado State',
  'rams': 'Colorado State',
  'oregon': 'Oregon',
  'ducks': 'Oregon',
  'clemson': 'Clemson',
  'nc state': 'NC State',
  'wolfpack': 'NC State',
  'st marys': "St. Mary's",
  "st. mary's": "St. Mary's",
  'gaels': "St. Mary's",
  'oakland': 'Oakland',
  'fau': 'FAU',
  'florida atlantic': 'FAU',
  'owls': 'FAU',
  'northwestern': 'Northwestern',
  'dayton': 'Dayton',
  'flyers': 'Dayton',
  'nevada': 'Nevada',
  'wolf pack': 'Nevada',
  'new mexico': 'New Mexico',
  'lobos': 'New Mexico',
  'byu': 'BYU',
  'csu': 'Colorado State',
  'ucla': 'UCLA',
  'bruins': 'UCLA',
  'usc': 'USC',
  'trojans': 'USC',
  'texas tech': 'Texas Tech',
  'red raiders': 'Texas Tech',
  'memphis': 'Memphis',
  'michigan': 'Michigan',
  'wolverines': 'Michigan',
  'ohio state': 'Ohio State',
  'osu': 'Ohio State',
  'buckeyes': 'Ohio State',
  'indiana': 'Indiana',
  'hoosiers': 'Indiana',
  'virginia': 'Virginia',
  'cavaliers': 'Virginia',
  'uva': 'Virginia',
  'louisville': 'Louisville',
  'cardinals': 'Louisville',
  'syracuse': 'Syracuse',
  'orange': 'Syracuse',
  'cuse': 'Syracuse',
  'arkansas': 'Arkansas',
  'razorbacks': 'Arkansas',
  'hogs': 'Arkansas',
  'lsu': 'LSU',
  'miami': 'Miami',
  'hurricanes': 'Miami',
  'pitt': 'Pittsburgh',
  'pittsburgh': 'Pittsburgh',
  'panthers': 'Pittsburgh',
  'oklahoma': 'Oklahoma',
  'sooners': 'Oklahoma',
  'texas am': 'Texas A&M',
  'aggies': 'Texas A&M',
  'tcu': 'TCU',
  'horned frogs': 'TCU',
  'west virginia': 'West Virginia',
  'wvu': 'West Virginia',
  'mountaineers': 'West Virginia',
  'providence': 'Providence',
  'friars': 'Providence',
  'seton hall': 'Seton Hall',
  'pirates': 'Seton Hall',
  'st johns': "St. John's",
  "st. john's": "St. John's",
  'xavier': 'Xavier',
  'musketeers': 'Xavier',
  'butler': 'Butler',
};

// Bet type patterns
const BET_PATTERNS = {
  spread: [
    /([+-]?\d+\.?\d*)\s*(?:spread|pts?|points?)?/i,
    /(?:spread|pts?|points?)\s*([+-]?\d+\.?\d*)/i,
    /giving\s*([+-]?\d+\.?\d*)/i,
    /getting\s*([+-]?\d+\.?\d*)/i,
  ],
  moneyline: [
    /\bml\b/i,
    /money\s*line/i,
    /moneyline/i,
    /straight\s*up/i,
    /\bsu\b/i,
  ],
  over: [
    /over\s*(\d+\.?\d*)/i,
    /\bo\s*(\d+\.?\d*)/i,
    /total\s*over/i,
  ],
  under: [
    /under\s*(\d+\.?\d*)/i,
    /\bu\s*(\d+\.?\d*)/i,
    /total\s*under/i,
  ],
  parlay: [
    /parlay/i,
    /combo/i,
    /accumulator/i,
  ],
};

// Unit patterns
const UNIT_PATTERNS = [
  /(\d+\.?\d*)\s*(?:units?|u)\b/i,
  /(\d+\.?\d*)\s*(?:units?|u)$/i,
  /\b(\d+)u\b/i,
  /betting\s*(\d+\.?\d*)/i,
  /risking\s*(\d+\.?\d*)/i,
  /(\d+\.?\d*)\s*on\s/i,
];

// Common message format patterns
const MESSAGE_PATTERNS = [
  // iMessage/SMS style: "Name: message"
  /^([A-Za-z]+(?:\s[A-Za-z]+)?)\s*:\s*(.+)$/m,
  // WhatsApp style: "[timestamp] Name: message"
  /^\[.*?\]\s*([A-Za-z]+(?:\s[A-Za-z]+)?)\s*:\s*(.+)$/m,
  // Discord style: "Name#1234: message" or "Name: message"
  /^([A-Za-z]+(?:#\d+)?)\s*:\s*(.+)$/m,
  // Slack style: "@name: message"
  /^@([A-Za-z_]+)\s*:\s*(.+)$/m,
  // GroupMe style: "Name - message"
  /^([A-Za-z]+(?:\s[A-Za-z]+)?)\s*-\s*(.+)$/m,
];

export function parseGroupChat(text: string): ParsedMessage[] {
  const lines = text.split('\n').filter((line) => line.trim());
  const messages: ParsedMessage[] = [];

  for (const line of lines) {
    const parsed = parseMessageLine(line);
    if (parsed && parsed.picks.length > 0) {
      messages.push(parsed);
    }
  }

  return messages;
}

function parseMessageLine(line: string): ParsedMessage | null {
  let username = '';
  let messageText = line;

  // Try to extract username from message
  for (const pattern of MESSAGE_PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      username = match[1].toLowerCase().replace(/[#\d]+$/, '').trim();
      messageText = match[2];
      break;
    }
  }

  // If no username found, use "unknown"
  if (!username) {
    username = 'unknown';
  }

  const picks = extractPicks(messageText);

  if (picks.length === 0) {
    return null;
  }

  return {
    username,
    text: messageText,
    picks,
  };
}

function extractPicks(text: string): ParsedPick[] {
  const picks: ParsedPick[] = [];
  const lowerText = text.toLowerCase();

  // Find teams mentioned
  const teamsFound: string[] = [];
  for (const [pattern, teamName] of Object.entries(TEAM_PATTERNS)) {
    const regex = new RegExp(`\\b${pattern}\\b`, 'i');
    if (regex.test(lowerText)) {
      if (!teamsFound.includes(teamName)) {
        teamsFound.push(teamName);
      }
    }
  }

  if (teamsFound.length === 0) {
    return picks;
  }

  // Determine bet type
  let betType: ParsedPick['betType'] = 'spread';
  let spread: number | undefined;

  // Check for parlay first
  for (const pattern of BET_PATTERNS.parlay) {
    if (pattern.test(lowerText)) {
      betType = 'parlay';
      break;
    }
  }

  // Check for moneyline
  if (betType !== 'parlay') {
    for (const pattern of BET_PATTERNS.moneyline) {
      if (pattern.test(lowerText)) {
        betType = 'moneyline';
        break;
      }
    }
  }

  // Check for over
  if (betType !== 'parlay' && betType !== 'moneyline') {
    for (const pattern of BET_PATTERNS.over) {
      const match = lowerText.match(pattern);
      if (match) {
        betType = 'over';
        break;
      }
    }
  }

  // Check for under
  if (betType !== 'parlay' && betType !== 'moneyline' && betType !== 'over') {
    for (const pattern of BET_PATTERNS.under) {
      const match = lowerText.match(pattern);
      if (match) {
        betType = 'under';
        break;
      }
    }
  }

  // Check for spread
  if (betType !== 'parlay' && betType !== 'moneyline' && betType !== 'over' && betType !== 'under') {
    for (const pattern of BET_PATTERNS.spread) {
      const match = lowerText.match(pattern);
      if (match) {
        spread = parseFloat(match[1]);
        betType = 'spread';
        break;
      }
    }
  }

  // Extract units
  let units = 1; // Default to 1 unit
  for (const pattern of UNIT_PATTERNS) {
    const match = lowerText.match(pattern);
    if (match) {
      units = parseFloat(match[1]);
      break;
    }
  }

  // Calculate confidence based on language cues
  let confidence = 0.7; // Base confidence

  const highConfidenceWords = ['lock', 'hammer', 'slam', 'love', 'max', 'fire', '🔥', 'all in', 'guaranteed'];
  const lowConfidenceWords = ['lean', 'slight', 'maybe', 'thinking', 'possibly', 'not sure', 'small'];

  for (const word of highConfidenceWords) {
    if (lowerText.includes(word)) {
      confidence = Math.min(confidence + 0.1, 0.95);
    }
  }

  for (const word of lowConfidenceWords) {
    if (lowerText.includes(word)) {
      confidence = Math.max(confidence - 0.15, 0.3);
    }
  }

  // Create picks for each team found
  for (const team of teamsFound) {
    picks.push({
      team,
      betType,
      spread,
      units,
      confidence,
      rawText: text,
    });
  }

  return picks;
}

export function suggestUsername(text: string, existingUsernames: string[]): string | null {
  const lowerText = text.toLowerCase();

  for (const username of existingUsernames) {
    if (lowerText.includes(username.toLowerCase())) {
      return username;
    }
  }

  return null;
}

export function formatParsedPick(pick: ParsedPick): string {
  let result = pick.team;

  if (pick.betType === 'spread' && pick.spread !== undefined) {
    result += ` ${pick.spread > 0 ? '+' : ''}${pick.spread}`;
  } else if (pick.betType === 'moneyline') {
    result += ' ML';
  } else if (pick.betType === 'over') {
    result += ' Over';
  } else if (pick.betType === 'under') {
    result += ' Under';
  } else if (pick.betType === 'parlay') {
    result += ' (Parlay)';
  }

  result += ` (${pick.units}u)`;

  return result;
}
