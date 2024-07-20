if GetResourceState('qb-core') ~= 'started' or GetResourceState('qbx_core') == 'started' then return end

QBCore = exports['qb-core']:GetCoreObject()
local isServer = IsDuplicityVersion()


function GetJobs()
    return QBCore.Shared.Jobs
end

JOBS = GetJobs()

if isServer then

    -- Get player object
    function GetPlayer(source)
        return QBCore.Functions.GetPlayer(source)
    end

    -- Get player data
    function GetPlayerData(source)
        return GetPlayer(source).PlayerData
    end

    -- Notify player
    function Notify(source, message, type)
        return QBCore.Functions.Notify(source, message, type)
    end

    -- Compare job to current job
    function CheckCurrentJob(source, job)
        return GetPlayerData(source).job.name == job
    end

    -- Validate if job can be set
    function CanSetJob(source, jobName)
        local jobs = GetPlayerJobs(GetPlayerData(source).citizenid)
        for _, job in pairs(jobs) do
            if jobName == job.job then
                return true
            end
        end
        return false
    end

    -- Set players job
    function SetPlayerJob(source, jobData)
        return GetPlayer(source).Functions.SetJob(jobData.job, jobData.grade)
    end

    -- Remove job from storage
    function RemovePlayerFromJob(source, job)
        if CheckCurrentJob(source, job) then
            GetPlayer(source).Functions.SetJob('unemployed', 0)
            return
        end
        return exports.qbx_core:RemovePlayerFromJob(GetPlayerData(source).citizenid, job)
    end

    function SetPlayerDuty(source, duty)
        return GetPlayer(source).Functions.SetJobDuty(duty)
    end

    local function adminRemoveJob(src, playerData, job)
        if DoesPlayerHaveJob(playerData.citizenid, job) then
            DeletePlayerJob(playerData.citizenid, job)
            Notify(src, ('Job: %s was removed from ID: %s'):format(job, playerData.source), 'success')
            if playerData.job.name == job then
                local player = GetPlayer(playerData.source)
                player.Functions.SetJob('unemployed', 0)
            end
        else
            Notify(src, 'Player doesn\'t have this job?', 'error')
        end
    end

    lib.addCommand('removejob',  {
        help = "Remove a job from the player's multijob.",
        params = {
            { name = 'id', help = 'Server ID of the player', type = 'playerId' },
            { name = 'job', help = 'Name of Job to remove', type = 'string' }
        }, restricted = 'group.admin'
    }, function(source, args)
        local playerData = GetPlayerData(args['id'])
        if not playerData then
            Notify(source, 'Player not online.', 'error')
            return
        end

        adminRemoveJob(source, playerData, args['job'])
    end)

    AddEventHandler('QBCore:Server:OnJobUpdate', function(playerSource, job)
        if job.name == 'unemployed' then return end
        local citizenid = GetPlayerData(playerSource).citizenid
        if GetPlayerJobWithGrade(citizenid, job) or GetPlayerJobCount(citizenid) then return end
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

    function ToggleDuty()
        return TriggerServerEvent('QBCore:ToggleDuty')
    end

    function GetPlayerJobs()
        local playerData = GetPlayerData()
        local jobMenu = {}
        local playerJobs = lib.callback.await('slrn_multijob:server:myJobs', false)
        for _, job in pairs(playerJobs) do
            local jobData = JOBS[job]
            local primaryJob = playerData.job.name == job.job
            jobMenu[#jobMenu + 1] = {
                currentJob = primaryJob,
                title = jobData.label,
                grade = jobData.grades[job.grade],
                jobName = job.job,
                duty = primaryJob and playerData.job.onduty or false,
            }
        end
        return jobMenu
    end

    RegisterNetEvent('QBCore:Client:OnJobUpdate', function()
        exports["lb-phone"]:SendCustomAppMessage('slrn_multijob', { action = 'update-jobs' })
    end)

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
