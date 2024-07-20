if GetResourceState('qbx_core') ~= 'started' then return end

if not lib.checkDependency('qbx_core', '1.7.0') then error() end

local isServer = IsDuplicityVersion()

function GetJobs()
    return exports.qbx_core:GetJobs()
end

JOBS = GetJobs()

if isServer then
    function GetPlayer(source)
        return exports.qbx_core:GetPlayer(source)
    end

    function GetPlayerData(source)
        return GetPlayer(source).PlayerData
    end

    function Notify(source, message, type)
        return exports.qbx_core:Notify(source, message, type)
    end

    function CheckCurrentJob(source, job)
        local playerData = GetPlayerData(source)
        return playerData.job.name == job
    end

    function CanSetJob(source, jobName)
        local playerData = GetPlayerData(source)
        local jobs = playerData.jobs
        for job, _ in pairs(jobs) do
            if jobName == job then
                return true
            end
        end
        return false
    end

    function SetPlayerJob(source, job)
        return exports.qbx_core:SetPlayerPrimaryJob(GetPlayerData(source).citizenid, job)
    end

    function RemovePlayerFromJob(source, job)
        return exports.qbx_core:RemovePlayerFromJob(GetPlayerData(source).citizenid, job)
    end

    function SetPlayerDuty(source, duty)
        return GetPlayer(source).Functions.SetJobDuty(duty)
    end

    AddEventHandler('qbx_core:server:onJobUpdate', function()
        JOBS = GetJobs()
    end)

else
    function GetPlayerData()
        return exports.qbx_core:GetPlayerData()
    end

    function Notify(message, type)
        return exports.qbx_core:Notify(message, type)
    end

    AddEventHandler('qbx_core:client:onJobUpdate', function()
        JOBS = GetJobs()
    end)
end
