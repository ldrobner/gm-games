import React, { ChangeEvent } from "react";
import type { View, ExpansionDraftSetupTeam } from "../../../common/types";

const TeamForm = ({
	classNamesCol,
	classNameLabel,
	confs,
	disablePop,
	disableStadiumCapacity,
	disableStatus,
	divs,
	handleInputChange,
	hideStatus,
	t,
}: {
	classNamesCol: [
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
		string,
	];
	classNameLabel?: string;
	confs: View<"manageTeams">["confs"];
	disablePop?: boolean;
	disableStatus?: boolean;
	disableStadiumCapacity?: boolean;
	divs: View<"manageTeams">["divs"];
	handleInputChange: (
		field: string,
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => void;
	hideStatus?: boolean;
	// Really should just be ExpansionDraftSetupTeam, but need to update Manage Teams
	t:
		| Omit<View<"manageTeams">["teams"][number], "tid">
		| (ExpansionDraftSetupTeam & {
				disabled?: boolean;
		  });
}) => {
	const divisions = divs.map(div => {
		const conf = confs.find(c => c.cid === div.cid);
		return {
			did: div.did,
			name: conf ? `${div.name} (${conf.name})` : div.name,
		};
	});

	return (
		<>
			<div className={classNamesCol[0]}>
				<div className="form-group">
					<label className={classNameLabel}>Region</label>
					<input
						type="text"
						className="form-control"
						onChange={e => handleInputChange("region", e)}
						value={t.region}
					/>
				</div>
			</div>
			<div className={classNamesCol[1]}>
				<div className="form-group">
					<label className={classNameLabel}>Name</label>
					<input
						type="text"
						className="form-control"
						onChange={e => handleInputChange("name", e)}
						value={t.name}
					/>
				</div>
			</div>
			<div className={classNamesCol[2]}>
				<div className="form-group">
					<label className={classNameLabel}>Abbrev</label>
					<input
						type="text"
						className="form-control"
						onChange={e => handleInputChange("abbrev", e)}
						value={t.abbrev}
					/>
				</div>
			</div>
			<div className={classNamesCol[3]}>
				<div className="form-group">
					<label className={classNameLabel}>Division</label>
					<select
						className="form-control"
						onChange={e => handleInputChange("did", e)}
						value={t.did}
					>
						{divisions.map(division => (
							<option key={division.did} value={division.did}>
								{division.name}
							</option>
						))}
					</select>
				</div>
			</div>
			<div className={classNamesCol[4]}>
				<div className="form-group">
					<label className={classNameLabel}>Population (millions)</label>
					<input
						type="text"
						className="form-control"
						disabled={disablePop}
						onChange={e => handleInputChange("pop", e)}
						value={t.pop}
					/>
				</div>
			</div>
			<div className={classNamesCol[5]}>
				<div className="form-group">
					<label className={classNameLabel}>Stadium Capacity</label>
					<input
						type="text"
						className="form-control"
						disabled={disableStadiumCapacity}
						onChange={e => handleInputChange("stadiumCapacity", e)}
						value={t.stadiumCapacity}
					/>
				</div>
			</div>
			<div className={classNamesCol[6]}>
				<div className="form-group">
					<label className={classNameLabel}>Logo URL</label>
					<input
						type="text"
						className="form-control"
						onChange={e => handleInputChange("imgURL", e)}
						value={t.imgURL}
					/>
				</div>
			</div>
			<div className={classNamesCol[7]}>
				<div className="form-group">
					<label className={classNameLabel}>Colors</label>
					<div className="d-flex">
						{[0, 1, 2].map(j => (
							<input
								key={j}
								type="color"
								className="form-control"
								onChange={e => handleInputChange(`colors${j}`, e)}
								value={t.colors[j]}
							/>
						))}
					</div>
				</div>
			</div>
			{!hideStatus ? (
				<div className={classNamesCol[8]}>
					<div className="form-group">
						<label className={classNameLabel}>Status</label>
						<select
							className="form-control"
							disabled={disableStatus}
							onChange={e => handleInputChange("disabled", e)}
							value={t.disabled ? "1" : "0"}
						>
							<option value="0">Active</option>
							<option value="1">Inactive</option>
						</select>
					</div>
				</div>
			) : null}
		</>
	);
};

export default TeamForm;
