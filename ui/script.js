async function addJob(info) {
    if (info.disabled) {
        const container = document.querySelector('#activeJob-card');
        container.innerHTML = '';
        
        var status = 'Go On Duty';
        if (info.duty) {
            status = 'Go Off Duty';
        }
        
        var jobPanel = `
        <div class="activeJob-name">${info.title}</div>
        <div class="activeJob-grade">${info.description}</div>
        <div class="activeJob-status" data-job="${info.jobName}">${status}</div>
        <div class="job-remove" data-job="${info.jobName}" data-title="${info.title}">Remove Job</div>`;
        $('#activeJob-card').append(jobPanel);

    } else {
        var jobPanel = `
        <div class="job-card">
            <div class="job-name">${info.title}</div>
            <div class="job-grade">${info.description}</div>
            <div class="job-status" data-job="${info.jobName}">Select</div>
            <div class="job-remove" data-job="${info.jobName}" data-title="${info.title}">Remove Job</div>
        </div>`;
        
        $('#jobs').append(jobPanel);
    }
};

async function loadJobs(jobs) {
    const elementsToRemove = document.querySelectorAll('.job-card');
    elementsToRemove.forEach(element => {
        element.remove();
    });
    jobs.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();    
        if (titleA < titleB) {
            return -1;
        }
        if (titleA > titleB) {
            return 1;
        }
        return 0;
    });
    for (i = 0; i < jobs.length; i++) {
        addJob(jobs[i]);
    }
};

window.addEventListener("load", () => {
    $.post('https://slrn_multijob/getJobs', JSON.stringify({}), function(data) {
        loadJobs(data);
    });

    $("body").on("click", ".activeJob-status", function(e) {
        e.preventDefault();
        fetchNui('toggleDuty', {});
    });

    $("body").on("click", ".job-status", function(e) {
        e.preventDefault();
        fetchNui('changeJob', this.dataset.job);
    });

    $("body").on("click", ".job-remove", function(e) {
        e.preventDefault();
        setPopUp({
            title: "Remove Job",
            description: "Remove " + this.dataset.title,
            buttons: [
                {
                    title: "Cancel",
                    color: "red",
                },
                {
                    title: "Confirm",
                    color: "green",
                    cb: () => {
                        fetchNui('removeJob', this.dataset.job);
                        $(this).parent().fadeOut();
                    }
                }
            ]
        })
    });
});

window.addEventListener("message", (event) => {
    if(event.data.action == "update-jobs") {
        $.post('https://slrn_multijob/getJobs', JSON.stringify({}), function(data) {
            loadJobs(data);
        });
    };
});