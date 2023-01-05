import { CampaignCoalition } from "@kilcekru/dcc-shared-rpc-types";
import { useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { useGeneratePackage } from "../../generatePackage";
import { useFaction } from "../../hooks";

const useCasPackagesTick = (coalition: CampaignCoalition) => {
	const [, { addPackage }] = useContext(CampaignContext);
	const generatePackage = useGeneratePackage(coalition);
	const faction = useFaction(coalition);

	return () => {
		const runningCASPackages = faction?.packages.filter((pkg) => {
			return pkg.task === "CAS";
		});
		const runningCASPackagesCount = runningCASPackages?.length ?? 0;

		if (runningCASPackagesCount < 1) {
			const pkg = generatePackage.cas();

			addPackage?.(pkg);
		}
	};
};

const useCapPackagesTick = (coalition: CampaignCoalition) => {
	const [, { addPackage }] = useContext(CampaignContext);
	const generatePackage = useGeneratePackage(coalition);
	const faction = useFaction(coalition);

	return () => {
		const runningCAPPackages = faction?.packages.filter((pkg) => {
			return pkg.task === "CAP";
		});
		const runningCAPPackagesCount = runningCAPPackages?.length ?? 0;

		if (runningCAPPackagesCount < 1) {
			const pkg = generatePackage.cap();

			addPackage?.(pkg);
		}
	};
};

const useAwacsPackagesTick = (coalition: CampaignCoalition) => {
	const [, { addPackage }] = useContext(CampaignContext);
	const generatePackage = useGeneratePackage(coalition);
	const faction = useFaction(coalition);

	return () => {
		const runningAWACSPackages = faction?.packages.filter((pkg) => {
			return pkg.task === "AWACS";
		});

		const runningAWACSPackagesCount = runningAWACSPackages?.length ?? 0;

		if (runningAWACSPackagesCount < 1) {
			const pkg = generatePackage.awacs();

			addPackage?.(pkg);
		}
	};
};

export const usePackagesTick = (coalition: CampaignCoalition) => {
	const cas = useCasPackagesTick(coalition);
	const cap = useCapPackagesTick(coalition);
	const awacs = useAwacsPackagesTick(coalition);

	return () => {
		cas();
		cap();
		awacs();
	};
};