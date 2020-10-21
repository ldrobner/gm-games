import type {
	GameAttributes,
	GameAttributesLeague,
	GameAttributesLeagueWithHistory,
} from "../../common/types";
import { PHASE, helpers } from "../../common";

export const gameAttributeHasHistory = (gameAttribute: any) => {
	return (
		Array.isArray(gameAttribute) &&
		gameAttribute.length > 0 &&
		gameAttribute[0] &&
		typeof gameAttribute[0].start === "number"
	);
};

// This will get filled by values from IndexedDB
const g: GameAttributes & {
	get: <T extends keyof GameAttributesLeague>(
		key: T,
		season?: number | "current",
	) => GameAttributesLeague[T];
	setWithoutSavingToDB: <T extends keyof GameAttributesLeague>(
		key: T,
		value: GameAttributesLeague[T] | GameAttributesLeagueWithHistory[T],
	) => void;
} = {
	lid: undefined,

	get: (key, season = Infinity) => {
		if (g.hasOwnProperty(key)) {
			// @ts-ignore
			const gameAttribute = g[key];

			if (gameAttributeHasHistory(gameAttribute)) {
				// Return value from row with highest starting season that is still <= the current season
				const season2 = season === "current" ? (g as any).season : season;
				for (let i = gameAttribute.length - 1; i >= 0; i--) {
					if (season2 >= gameAttribute[i].start) {
						return gameAttribute[i].value;
					}
				}

				// Should never reach here
				return gameAttribute[0].value;
			}

			// @ts-ignore
			return gameAttribute;
		}

		throw new Error(`Attempt to get g.${key} while it is not already set`);
	},

	setWithoutSavingToDB: (key, value) => {
		// Should this error when setting a key that doesn't exist, like setting a value form GameAttributesLeague when not in a league? Maybe, but need a way to initialize it first.
		// @ts-ignore
		g[key] = value;
	},
};

export const wrap = <T extends keyof GameAttributesLeague>(
	gameAttributes: any,
	key: T,
	value: GameAttributesLeague[T],
) => {
	// @ts-ignore
	const gameAttribute = gameAttributes[key];

	if (!gameAttributeHasHistory(gameAttribute)) {
		return value;
	}

	const cloned = helpers.deepCopy(gameAttribute);

	const latestRow = cloned[cloned.length - 1];

	let currentSeason =
		gameAttributes.season !== undefined
			? gameAttributes.season
			: g.get("season");

	let actualPhase =
		gameAttributes.phase !== undefined ? gameAttributes.phase : g.get("phase");
	if (actualPhase < 0) {
		const nextPhase = g.get("nextPhase");
		if (nextPhase !== undefined) {
			actualPhase = nextPhase;
		}
	}

	if (key === "userTid") {
		// For userTid, final update for current season happens in newPhaseBeforeDraft, where it's still PHASE.PLAYOFFS
		if (actualPhase > PHASE.PLAYOFFS) {
			currentSeason += 1;
		}
	} else {
		// Currently this applies to confs, divs, numGamesPlayoffSeries, and numPlayoffByes, which all can only be changed for this season before the playoffs. For ties it might be better to do this for REGULAR_SEASON too, but that'd also be confusing for people who don't see the change immediately happen.
		if (actualPhase >= PHASE.PLAYOFFS) {
			currentSeason += 1;
		}
	}

	// This mutates, but the result supposed to be updated immediately anyway, so whatever
	if (latestRow.start === currentSeason) {
		latestRow.value = value;
	} else {
		cloned.push({
			start: currentSeason,
			value,
		});
	}

	return cloned;
};

// Get latest value
export const unwrap = <T extends keyof GameAttributesLeague>(
	gameAttributes: any,
	key: T,
): GameAttributesLeague[T] => {
	if (gameAttributeHasHistory(gameAttributes[key])) {
		return gameAttributes[key][gameAttributes[key].length - 1].value;
	}

	return gameAttributes[key];
};

export default g;
