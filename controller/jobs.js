'use strict';
const job_monitor_send_dailyemails = require('../service/job-monitor-send-dailyemails');
// const logger = require('../lib/logger');

exports.jobs = async (method, namespace) => {

	// console.log('index.js.....req.params.method.......: ' + method)
	// console.log('index.js.....req.query.namespace.......: ' + namespace)
	switch (method) {

		case "monitor-send-dailyemails": {
            try {

                // console.log('======================= START: controller_jobs.js');
            
                const jobs = await job_monitor_send_dailyemails.jobs(namespace);
                let js_obj = JSON.parse(jobs);

                if(js_obj.status == 100){       //simulate testing.....
                    // console.log('....PARAM=deleted_job_item: ' + js_obj.name);
                    console.log('....Email Alert : NOTIFICATION HERE, THIS Cronjob of ' + js_obj.name  + ' been removed and a new job be restarted !!!');
                }// end ALERT TO TEAM for job restarted

                // console.log('======================= END: controller_jobs.js');

                let obj = new Object();
                obj.status = "200";
                obj.message = js_obj.message;
                return JSON.stringify(obj); 

            } catch (error) {
                // logger(error, this);

                let obj = new Object();
                obj.status = "400";
                obj.message = error.message;
                return JSON.stringify(obj); 

            }
        } // end: case "monitor-send-dailyemails": {

    } // end : switch ()

};
