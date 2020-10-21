import PropTypes from "prop-types";
import React, { useState } from "react";
import {
	DataTable,
	DraftAbbrev,
	SkillsBlock,
	PlayerNameLabels,
} from "../components";
import useTitleBar from "../hooks/useTitleBar";
import { getCols, helpers, downloadFile, toWorker, useLocal } from "../util";
import type { View } from "../../common/types";
import { PLAYER, NO_LOTTERY_DRAFT_TYPES } from "../../common";

const ExportButton = ({ season }: { season: number }) => {
	const [exporting, setExporting] = useState(false);
	return (
		<button
			className="btn btn-secondary"
			disabled={exporting}
			onClick={async () => {
				setExporting(true);

				const { filename, json } = await toWorker(
					"main",
					"exportDraftClass",
					season,
				);
				downloadFile(filename, json, "application/json");

				setExporting(false);
			}}
		>
			Export draft class
		</button>
	);
};

const DraftSummary = ({
	challengeNoRatings,
	draftType,
	players,
	season,
	startingSeason,
	stats,
	userTid,
}: View<"draftSummary">) => {
	const noDraft = draftType === "freeAgents";

	useTitleBar({
		title: noDraft ? "Prospects History" : "Draft History",
		jumpTo: true,
		jumpToSeason: season,
		dropdownView: "draft_history",
		dropdownFields: { seasonsAndOldDrafts: season },
	});

	const superCols = [
		{
			title: "",
			colspan: 3,
		},
		{
			title: noDraft ? "As Prospect" : "At Draft",
			colspan: 5,
		},
		{
			title: "Current",
			colspan: 5,
		},
		{
			title: "Career Stats",
			colspan: 7,
		},
	];

	const cols = getCols(
		"Pick",
		"Name",
		"Pos",
		"Team",
		"Age",
		"Ovr",
		"Pot",
		"Skills",
		"Team",
		"Age",
		"Ovr",
		"Pot",
		"Skills",
		...stats.map(stat => `stat:${stat}`),
	);

	const teamInfoCache = useLocal(state => state.teamInfoCache);

	const rows = players.map(p => {
		const showRatings = !challengeNoRatings || p.currentTid === PLAYER.RETIRED;

		return {
			key: p.pid,
			data: [
				p.draft.round >= 1 ? `${p.draft.round}-${p.draft.pick}` : null,
				<PlayerNameLabels pid={p.pid} skills={p.currentSkills} watch={p.watch}>
					{p.name}
				</PlayerNameLabels>,
				p.pos,
				{
					searchValue: `${teamInfoCache[p.draft.tid]?.abbrev} ${
						teamInfoCache[p.draft.originalTid]?.abbrev
					}`,
					sortValue: `${p.draft.tid} ${p.draft.originalTid}`,
					value: (
						<DraftAbbrev
							originalTid={p.draft.originalTid}
							tid={p.draft.tid}
							season={season}
						/>
					),
				},
				p.draft.age,
				showRatings ? p.draft.ovr : null,
				showRatings ? p.draft.pot : null,
				<span className="skills-alone">
					<SkillsBlock skills={p.draft.skills} />
				</span>,
				<a
					href={helpers.leagueUrl([
						"roster",
						`${p.currentAbbrev}_${p.currentTid}`,
					])}
				>
					{p.currentAbbrev}
				</a>,
				p.currentAge,
				showRatings ? p.currentOvr : null,
				showRatings ? p.currentPot : null,
				<span className="skills-alone">
					<SkillsBlock skills={p.currentSkills} />
				</span>,
				...stats.map(stat => helpers.roundStat(p.careerStats[stat], stat)),
			],
			classNames: {
				"table-danger": p.hof,
				"table-info": p.draft.tid === userTid,
			},
		};
	});

	return (
		<>
			<p>
				More:{" "}
				<a href={helpers.leagueUrl(["draft_scouting"])}>
					{!noDraft ? "Draft Scouting" : "Upcoming Prospects"}
				</a>{" "}
				|{" "}
				{!NO_LOTTERY_DRAFT_TYPES.includes(draftType) ? (
					<>
						<a href={helpers.leagueUrl(["draft_lottery", season])}>
							Draft Lottery
						</a>{" "}
						|{" "}
					</>
				) : null}
				<a href={helpers.leagueUrl(["draft_team_history"])}>Team History</a>
			</p>

			<p>
				Players drafted by your team are{" "}
				<span className="text-info">highlighted in blue</span>. Players in the
				Hall of Fame are <span className="text-danger">highlighted in red</span>
				.
			</p>

			{season >= startingSeason ? <ExportButton season={season} /> : null}

			<DataTable
				cols={cols}
				defaultSort={[0, "asc"]}
				name="DraftSummary"
				rows={rows}
				superCols={superCols}
			/>
		</>
	);
};

DraftSummary.propTypes = {
	draftType: PropTypes.string.isRequired,
	players: PropTypes.arrayOf(PropTypes.object).isRequired,
	season: PropTypes.number.isRequired,
	startingSeason: PropTypes.number.isRequired,
	stats: PropTypes.arrayOf(PropTypes.string).isRequired,
	userTid: PropTypes.number.isRequired,
};

export default DraftSummary;
