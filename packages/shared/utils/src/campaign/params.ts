import * as DcsJs from "@foxdelta2/dcsjs";

export const AiSkillLabel: Record<DcsJs.AiSkill, string> = {
	Average: "Rookie",
	Good: "Trained",
	High: "Veteran",
	Excellent: "Ace",
};

export function AiSkillToIndex(skill: DcsJs.AiSkill): number {
	switch (skill) {
		case "Average":
			return 0;
		case "Good":
			return 1;
		case "High":
			return 2;
		case "Excellent":
			return 3;
	}
}

export function IndexToAiSkill(index: number): DcsJs.AiSkill {
	switch (index) {
		case 0:
			return "Average" as const;
		case 1:
			return "Good" as const;
		case 2:
			return "High" as const;
		case 3:
			return "Excellent" as const;
	}

	return "Average" as const;
}
