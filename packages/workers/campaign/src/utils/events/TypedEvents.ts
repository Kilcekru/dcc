/* eslint-disable @typescript-eslint/no-empty-interface */

export interface Aircraft {}

export interface Airdrome {}

export interface CapFlightGroup {}

export interface CasFlightGroup {}

export interface Entity {
	destructed: void;
}

export interface EscortFlightGroup {}

export interface EscortedFlightGroup {}

export interface FlightGroup {}

export interface GroundGroup {}

export interface GroundUnit {}

export interface Group {}

export interface HomeBase {}

export interface MapEntity {}

export interface Objective {}

export interface Package {}

export interface StrikeFlightGroup {}

export interface Structure {}

export interface Unit {}

export type All = Aircraft &
	Airdrome &
	CapFlightGroup &
	CasFlightGroup &
	Entity &
	EscortFlightGroup &
	EscortedFlightGroup &
	FlightGroup &
	GroundGroup &
	GroundUnit &
	Group &
	HomeBase &
	MapEntity &
	Objective &
	Package &
	StrikeFlightGroup &
	Structure &
	Unit;
