local logName = 'DCS.JS.MISSION'
local function debugLog(message) log.write(logName, log.INFO, tostring(message)) end

local function printObj(obj, hierarchyLevel) 
    if (hierarchyLevel == nil) then
        hierarchyLevel = 0
    elseif (hierarchyLevel == 4) then
        return 0
    end
    
    local whitespace = ""
    for i=0,hierarchyLevel,1 do
        whitespace = whitespace .. "-"
    end
    
    debugLog(obj)
    if (type(obj) == "table") then
        for k,v in pairs(obj) do
        -- io.write(whitespace .. "-")
        if (type(v) == "table") then
            printObj(v, hierarchyLevel+1)
        else
            debugLog(v)
        end           
        end
    else
        debugLog(obj)
    end
end

debugLog("Load Mission Config...")
printObj(config)

for i in pairs(config.clientFlightGroups) do
    local flightGroup = config.clientFlightGroups[i]
    
    local ewr = DEWR:New(flightGroup.groupId, flightGroup.name)
    ewr.Start()

    if flightGroup.task == "CAS" then
        local cas = DCAS:New(flightGroup.groupId, flightGroup.name, flightGroup.jtacName, flightGroup.targetGroupName)
        cas:Start()
    end
end

debugLog("----------------------")
debugLog("DCC Mission is ready")
debugLog("----------------------")