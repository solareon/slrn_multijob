if GetResourceState('qb-core') ~= 'started' or GetResourceState('qbx_core') == 'started' then return end

QBCore = exports['qb-core']:GetCoreObject()
local isServer = IsDuplicityVersion()


function GetJobs()
    return QBCore.Shared.Jobs
end

JOBS = GetJobs()

if isServer then
    function GetPlayer(source)
        return QBCore.Functions.GetPlayer(source)
    end

    function GetPlayerData(source)
        return GetPlayer(source).PlayerData
    end

    function Notify(source, message, type)
        return QBCore.Functions.Notify(source, message, type)
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

    AddEventHandler('QBCore:Server:OnJobUpdate', function(playerSource, job)
        local citizenid = GetPlayerData(playerSource).citizenid
        if GetPlayerJob(citizenid, job) or GetPlayerJobCount(citizenid) then return end
        AddPlayerJob(citizenid, job.name, job.grade)
    end)

    AddEventHandler('QBCore:Server:UpdateObject', function()
        JOBS = GetJobs()
    end)

    AddEventHandler('onResourceStart', function(resource)
        if resource ~= GetCurrentResourceName() then return end
        MySQL.query([=[
            CREATE TABLE IF NOT EXISTS `save_jobs` (
                `cid` VARCHAR(100) NOT NULL,
                `job` VARCHAR(100) NOT NULL,
                `grade` INT(11) NOT NULL,
                UNIQUE KEY `cid_job` (`cid`,`job`)
            );
        ]=])
    end)

else
    function GetPlayerData()
        return QBCore.Functions.GetPlayerData()
    end

    function Notify(message, type)
        return QBCore.Functions.Notify(message, type)
    end

    AddEventHandler('QBCore:Client:OnSharedUpdate', function(data)
        Wait(0)
        if data ~= 'Jobs' then return end
        JOBS = GetJobs()
    end)

    AddEventHandler('QBCore:Client:OnSharedUpdateMultiple', function(data)
        Wait(0)
        if data ~= 'Jobs' then return end
        JOBS = GetJobs()
    end)
end
