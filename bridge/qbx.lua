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

    function GetJobs()
        local playerData = GetPlayerData()
        local jobMenu = {}
        for job, grade in pairs(playerData.jobs) do
            local jobData = JOBS[job]
            jobMenu[#jobMenu + 1] = {
                currentJob = playerData.job.name == job,
                title = jobData.label,
                grade = jobData.grades[grade],
                jobName = job,
                duty = playerData.job.name == job and playerData.job.onduty or false,
            }
        end
        return jobMenu
    end

    function ToggleDuty()
        return TriggerServerEvent('QBCore:ToggleDuty')
    end

    RegisterNetEvent('QBCore:Client:OnJobUpdate', function()
        exports["lb-phone"]:SendCustomAppMessage('slrn_multijob', { action = 'update-jobs' })
    end)

    AddEventHandler('qbx_core:client:onJobUpdate', function()
        JOBS = GetJobs()
    end)
end
