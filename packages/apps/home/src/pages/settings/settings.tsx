import { rpc } from "@kilcekru/dcc-lib-rpc";
import { createSignal, onMount } from "solid-js";

import { useLoadUserConfig, useSetAction, useSetError, useUserConfig } from "../../store";
import { PathSelector } from "./pathSelector";

export const Settings = () => {
	const userConfig = useUserConfig();
	const setError = useSetError();
	const setAction = useSetAction();
	const loadUserConfig = useLoadUserConfig();

	const [paths, setPaths] = createSignal<Paths>({ install: { valid: false }, savedGames: { valid: false } });

	const onChangeInstall = async (path: string) => {
		const valid = await rpc.home.validateDcsInstallPath(path);
		setPaths((paths) => ({
			install: {
				value: path,
				valid,
			},
			savedGames: paths.savedGames,
		}));
	};

	const onChangeSavedGames = async (path: string) => {
		const valid = await rpc.home.validateDcsSavedGamesPath(path);
		setPaths((paths) => ({
			install: paths.install,
			savedGames: {
				value: path,
				valid,
			},
		}));
	};

	const onContinue = async () => {
		try {
			const p = paths();
			if (p.install.valid && p.install.value != undefined && p.savedGames.valid && p.savedGames.value != undefined) {
				await rpc.home.setDcsPaths({ install: p.install.value, savedGames: p.savedGames.value });
			} else {
				await rpc.home.setDcsNotAvailable();
			}
			await loadUserConfig();
			setAction(undefined);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Unknown error";
			setError(new Error(`filePaths.onContinue failed: ${msg}`));
		}
	};

	onMount(async () => {
		if (userConfig?.dcs?.available) {
			setPaths({
				install: { value: userConfig.dcs.paths.install, valid: true },
				savedGames: { value: userConfig.dcs.paths.savedGames, valid: true },
			});
		} else {
			try {
				const paths = await rpc.home.findDcsPaths();
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
		}
	});

	return (
		<div>
			<h2>DCS Directories</h2>
			<PathSelector description="DCS Installation Directory" value={paths().install} onChange={onChangeInstall} />
			<PathSelector description="DCS Saved Games Directory" value={paths().savedGames} onChange={onChangeSavedGames} />
			{/* <PathSelector description="Download" value={""} onChange={onChangeSavedGames} /> */}
			<div>
				<button disabled={!paths().install.valid || !paths().savedGames.valid} onClick={onContinue}>
					Continue
				</button>
				<button onClick={onContinue}>Continue without DCS</button>
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
