# What is the purposive of the map/theatre master mission?
In order for DCC to use a map, the app must know how the map is structured and where it can place units.
# What is the current goal?
In the first step the objectives should be defined that a scenario with a distance of 100-200nm can use this map.

Afterwards the map can be expanded so more scenarios can be created for this map.
# Current limitations
DCC can't currently not handle waterways. That means a scenario can not jump from a isle to another isle/continent. But having an airport(with some other objectives for SAMs) on another isle is possible. But then the other faction can not conquer this airport/objectives.
# What to define?
## Objectives
This is the core element. With objectives DCC can understands the places the map.
### Where to place a objectives
Objectives should be placed on or around interesting places like towns or cities.
Objectives should always be around other objectives but must not overlap with other objectives.
You can create lines of objectives if the space between lines are not "interesting"(empty space) or not usable(mountains).
### How
Create a Trigger Zone with type "Circular".
### Name
Town|[Name]  
The name shou  
Example: `Town|Al Hafar`
## Structures
Every objectives should have two structures.  
Every structure should have enough space around it, so DCC can place a group of building at this location.  
If the objectives doesn't have enough space for structures you can only place one structure or none.  
If you needed to skip structures add them to another objectives nearby, if possible.   
The structure should be spread out if possible.  
### How
Any static object with country "Russia" and red coalition.
### Name
[Objective Name]|Structure|[1-n]  
Example: `Al Hafar|Structure|1`
## Ground Groups
Every objectives should have two ground groups.  
Every ground group has 8 units.  
Place this units in an interesting way, but the units should somewhat in open area so it's not too hard to find the target from an aircraft.  
If the objectives doesn't have enough space for two ground groups you can only place one group or none.  
Whenever possible, the ground groups should not be within reach of groups of other objectives.  
### How
Any ground units with country "Russia" and red coalition.
Unit Group size: 8
### Name
Group Name:[Objective Name]|Vehicle|[1-n]  
Example: `Al Hafar|Vehicle|1`
## SHORAD
Every objectives should have two SHORAD units.
Place the SHORAD units in the surroundings of the ground groups
### How
Any ground units with country "Russia" and red coalition.
Unit Group size: 1
### Name
Group Name:[Objective Name]|AAA|[1-n]  
Example: `Al Hafar|AAA|1`
## SAM
SAM units should be randomly distributed on the map. With a focus on airports. Each airport within the scenario should have 2-3 possible SAM positions within 20km.
### How
Use the template for the SA-10 for the country "Russia" and red coalition.
### Name
Group Name:[Objective Name]|SAM|[1-n]  
Example: `Knaiseh|SAM|1`