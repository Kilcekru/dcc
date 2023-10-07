# DCC - Digital Crew Chief

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Discord](https://img.shields.io/discord/1110123808356040734?label=Discord&logo=discord)](https://discord.gg/jZZ3pFpY3e)

100% flying, 0% configuration.

DCC is meant to be a toolkit offering simple apps to enhance your flying experience in [Digital Combat Simulator](https://www.digitalcombatsimulator.com/).\
Still in early development we currently only offer a dynamic campaign, but more apps are planned (see [Roadmap](#roadmap)).

- [Installation](#installation)
- [How does the Campaign work](#how-does-the-campaign-work)
  - [Scenario](#scenario)
  - [Faction](#faction)
  - [Hardcore](#hardcore)
  - [Carrier](#carrier)
  - [Airport Capture](#airport-capture)
- [Structures](#structures)
  - [Ammo Depot](#ammo-depot)
  - [Barrack](#barrack)
  - [Command Center](#command-center)
  - [Depot](#depot)
  - [Farp](#farp)
  - [Power Plant](#power-plant)
  - [Fuel Storage](#fuel-storage)
  - [Hospital](#hospital)
  - [Prison](#prison)
- [Mission Types](#mission-types)
  - [DEAD](#dead)
  - [CAP](#cap)
  - [Strike](#strike)
  - [Escort](#escort)
  - [CAS](#cas)
  - [CSAR](#csar)
- [Persistence](#persistence)
- [Multiplayer](#multiplayer)
- [Current Limitation](#current-limitation)
- [Upcoming Features](#upcoming-features)
- [Roadmap](#roadmap)
- [Discord](#discord)
- [Contributing](#contributing)
- [Contributors](#contributors)

## Installation
- Download the latest release `Setup.zip` from github
- Extract the zip and run the `Setup.exe` (The Installer is not yet signed, so Windows might warn you about an unknown source)
- The installer installs all necessary files, creates a Desktop Shortcut and launches the app. You can delete the Setup afterwards
- Inside DCC you can setup the paths to your DCS folders and then start the campaign app
- You are ready to go, have fun

# Dynamic Campaign
Campaign Mode for Digital Combat Simulator(DCS) inspired by Falcon BMS and Liberation
---no configuration, just fly---

![App Screenshot](docs/campaign-1.png)

## How does the Campaign work
The campaign is defined by two definition, Scenario and faction.
Once the campaign is started each site/faction tries to archive the defined win condition automatically.
The player can always choose the occupy one (or more) of the planned or active flight group/mission and play the mission out in DCS.
After flying the mission in DCS the results are processed back into the campaign.

### Scenario
The scenario defines on which map and when the campaign takes place. It also says what the win condition is. And what objective and structures are allocated to which side at the start of the campaign.

### Faction
This defines which planes, helicopters and ground units are available for the given faction. Aircraft availability can be set individually for the different mission types.

### Hardcore
You can choose at campaign start to activate the hardcore mode. Hardcore means if you(or a client in multiplayer) dies in a mission the campaign fails.

### Carrier
A carrier will be automatically added to the campaign(if one was selected in the faction) if your faction has a carrier capable plane.
You can switch between a super carrier or carrier in the faction.

### Airport Capture
You can capture(or lose) an airport if all surrounded objectives(5nm) are captured by your ground units.

## Structures
Structures are a collection of building which provide a service for the controlling faction. To prevent these services the opposite faction can destroy the buildings with a Strike mission or capture the structure with ground units.
Is a building destroyed it will be repaired over a period of time.

### Ammo Depot
Provides Ammo for Barracks and Depots nearby to improve the deploy time of this structures.

### Barrack
Deploys periodically infantry units to enemy objectives.

### Command Center
Controls the SAM Network(IADS) - coming coon

### Depot
Deploys periodically vehicle units to enemy objectives.

### Farp
Allows the use Helicopters near the frontline

### Power Plant
Provides electricity to structures and SAMs(IADS - coming soon) nearby to improve the deploy time of this structures.

### Fuel Storage
Provides Fuel for Depots nearby to improve the deploy time of this structures.

### Hospital
Cares for the wounded pilots and soldiers. Which helps the deploy time for the next aircrafts or ground groups. (Not fully implemented)

### Prison
Holds captured pilots and soldiers. (Not fully implemented)

## Mission Types

### DEAD
Destruction Enemy Air Defense. The SAM is destroyed if the track radar is destroyed.

### CAP
Combat Air Patrol. Flight between the given waypoints and attack all enemy aircraft in range.

### Strike
Destroy all buildings at the given waypoint.

### Escort
Protect the designated Strike Group from enemy air threads. Communication Tools to find your escort target are available in the Communication Menu.

### CAS
Close Air Support. Destroy enemy ground units between the given waypoints. Communication Tools with a JTAC to find the targets are available in the Communication Menu.

### CSAR
Combat search and rescue. Find and rescue previously downed pilots with a helicopter. Communication Tools with the pilot are available in the Communication Menu.

## Persistence
Make sure DCS allows DCC to save it state with the following step.
These needs do be done after each DCS update.
Change the following lines in the file in the DCS installation folder 'DCS World/Scripts/MissionScripting.lua'
From:
```
do
   sanitizeModule('os')
   sanitizeModule('io')
   sanitizeModule('lfs')
   _G['require'] = nil
   _G['loadlib'] = nil
   _G['package'] = nil
end
```
To:
```
do
   sanitizeModule('os')
   -- sanitizeModule('io')
   -- sanitizeModule('lfs')
   _G['require'] = nil
   _G['loadlib'] = nil
   _G['package'] = nil
end
```

## Multiplayer
DCC can be used for multiplayer sessions.
You can selected multiple slots and multiple flight groups in DCC flight group list(currently max two clients per flight group)
If the clients are spread over multiple flight groups the mission start time will be set to the earliest flight group start time.

To start a multiplayer mission you can either start it on the PC running DCC. 
Or on an additional server, in which case 
the file "dcc_state.json" created by the mission must be copied back (to the folder where the mission file was created) 
so that DCC can take over the result of this mission. 
## Current Limitation
Many systems within the Campaign are currently implemented in a simplified way. 
For example the ground battle currently doesn't distinguishes between the vehicle/infantry type.
We will improve and expand these systems in the future.


## Roadmap
### App Features
- Quick Mission: Create a simple mission that offers immersion into a battlefield
- Patcher: Apply patches to DCS to easily configure your setup
- Controls: Drag & Drop setup for your Joystick / Throttle
- Mods: Install and Remove supported DCS mods with a simple click

### Dynamic Campaign
[Roadmap](https://github.com/users/Kilcekru/projects/2)

## Discord
[Join our Discord server and stay connected.](https://discord.gg/jZZ3pFpY3e)

## Contributing

Contributions are always welcome!\
See [contributing](CONTRIBUTING.md) for ways to get started.\
Please adhere to this project's [code of conduct](CODE_OF_CONDUCT.md).

## Contributors
- [@Kilcekru](https://github.com/kilcekru)
- [@rhyver](https://github.com/rhyver)

