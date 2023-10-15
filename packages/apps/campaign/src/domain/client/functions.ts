import type * as DcsJs from "@foxdelta2/dcsjs";

export function calcTakeoffTime(packages: Array<DcsJs.FlightPackage> | undefined) {
	return packages?.reduce(
		(prev, pkg) => {
			const hasClients = pkg.flightGroups.some((fg) => fg.units.some((u) => u.client));

			if (hasClients) {
				if (prev == null || pkg.startTime < prev) {
					return pkg.startTime;
				}
			}

			return prev;
		},
		undefined as number | undefined,
	);
}

export function flightGroupClientCount(flightGroup: DcsJs.FlightGroup | undefined) {
	return flightGroup?.units.filter((unit) => unit.client).length ?? 0;
}

export function flightGroupHasClient(flightGroup: DcsJs.FlightGroup | undefined) {
	return flightGroupClientCount(flightGroup) > 0;
}

export function packageHasClient(pkg: DcsJs.FlightPackage | undefined) {
	return pkg?.flightGroups.some((fg) => flightGroupHasClient(fg));
}
