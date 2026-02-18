/**
 * @typedef {Object} TeamBuilderPlayer
 * @property {string} name - Riot ID (gameName#tagLine)
 * @property {string} role - TOP, JUNGLE, MID, ADC, SUPPORT
 * @property {string|null} region
 * @property {Object|null} profileData - fetched profile data
 */

/**
 * @typedef {Object} GameSlot
 * @property {string} role
 * @property {string|null} championId
 * @property {string|null} championName
 */

/**
 * @typedef {Object} Game
 * @property {number} gameIndex
 * @property {Object} blue - { players: GameSlot[] }
 * @property {Object} red - { players: GameSlot[] }
 * @property {'BLUE'|'RED'|null} winner
 */

/**
 * @typedef {Object} SeriesState
 * @property {number} totalGames - total number of games in series
 * @property {Game[]} games
 * @property {Object} blue - { name: string, players: TeamBuilderPlayer[], score: number }
 * @property {Object} red - { name: string, players: TeamBuilderPlayer[], score: number }
 * @property {'SETUP'|'IN_PROGRESS'|'COMPLETED'} status
 */

export default {};
