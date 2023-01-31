import { rpc } from "@kilcekru/dcc-lib-rpc";
import { DcsPaths } from "@kilcekru/dcc-shared-rpc-types";
import { createEffect, createSignal } from "solid-js";

import { PathSelector } from "./pathSelector";

interface DcsPathSelectorProps {
	paths: DcsPaths | undefined;
	onSelect: (paths?: DcsPaths) => void;
}

export const DcsPathSelector = (props: DcsPathSelectorProps) => {
	const [paths, setPaths] = createSignal<Paths>({ install: { valid: false }, savedGames: { valid: false } });

	const detectPaths = async () => {
		try {
			const paths = await rpc.launcher.findDcsPaths();
			setPaths({
				install: {
					value: paths.install,
					valid: paths.install != undefined,
				},
				savedGames: {
					value: paths.savedGames,
					valid: paths.savedGames != undefined,
				},
			});
		} catch (err) {
			console.error("err", err); // eslint-disable-line no-console
		}
	};

	const onChangeInstall = async (path: string) => {
		const valid = await rpc.launcher.validateDcsInstallPath(path);
		setPaths((paths) => ({
			install: {
				value: path,
				valid,
			},
			savedGames: paths.savedGames,
		}));
	};

	const onChangeSavedGames = async (path: string) => {
		const valid = await rpc.launcher.validateDcsSavedGamesPath(path);
		setPaths((paths) => ({
			install: paths.install,
			savedGames: {
				value: path,
				valid,
			},
		}));
	};

	const onContinue = () => {
		const p = paths();
		if (p.install.valid && p.install.value != undefined && p.savedGames.valid && p.savedGames.value != undefined) {
			props.onSelect({ install: p.install.value, savedGames: p.savedGames.value });
		}
	};

	createEffect(() => {
		if (props.paths != undefined) {
			setPaths({
				install: { value: props.paths.install, valid: true },
				savedGames: { value: props.paths.savedGames, valid: true },
			});
		} else {
			void detectPaths();
		}
	});

	return (
		<div>
			<h2>DCS Directories</h2>
			<PathSelector description="DCS Installation Directory" value={paths().install} onChange={onChangeInstall} />
			<PathSelector description="DCS Saved Games Directory" value={paths().savedGames} onChange={onChangeSavedGames} />
			<div>
				<button disabled={!paths().install.valid || !paths().savedGames.valid} onClick={onContinue}>
					Continue
				</button>
				<button onClick={() => props.onSelect()}>Continue without DCS</button>
			</div>
		</div>
	);
};

interface Paths {
	install: {
		value?: string;
		valid: boolean;
	};
	savedGames: {
		value?: string;
		valid: boolean;
	};
}
