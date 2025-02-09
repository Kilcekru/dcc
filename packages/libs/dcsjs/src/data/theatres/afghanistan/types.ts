import * as z from "zod";

export namespace Schema {
	export const airdromeName = z.enum([
		"Anapa-Vityazevo",
		"Krasnodar-Center",
		"Novorossiysk",
		"Krymsk",
		"Maykop-Khanskaya",
		"Gelendzhik",
		"Sochi-Adler",
		"Krasnodar-Pashkovsky",
		"Sukhumi-Babushara",
		"Gudauta",
		"Batumi",
		"Senaki-Kolkhi",
		"Kobuleti",
		"Kutaisi",
		"Mineralnye Vody",
		"Nalchik",
		"Mozdok",
		"Tbilisi-Lochini",
		"Soganlug",
		"Vaziani",
		"Beslan",
	]);
}
export type AirdromeName = z.infer<typeof Schema.airdromeName>;
