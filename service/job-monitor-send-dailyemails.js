'use strict';

const Client = require('kubernetes-client').Client;
// const logger = require('../lib/logger');

const k8s = require('@kubernetes/client-node')
const ClientNodeBackend = require('kubernetes-client/backends/kubernetes-client-node')

const TimeAgo = require('javascript-time-ago');
const en = require('javascript-time-ago/locale/en');

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-US');



module.exports.jobs = async namespace => {

	try {

		const kubeconfig = new k8s.KubeConfig()
		kubeconfig.loadFromCluster();		

	  
		const backend = new ClientNodeBackend({ client: k8s, kubeconfig })
		const client = new Client({ backend, version: '1.13' })

		const jobs_arr = [];
		const jobs = await client.apis.batch.v1.namespaces(namespace).jobs.get();

		for (let i = 0; i < jobs.body.items.length; i++) {
		const item = jobs.body.items[i];
		const itemStatus = item.status;

		let readyContainers = 0;
		let restartCount = 0;

		if (itemStatus.containerStatuses) {
		itemStatus.containerStatuses.forEach((containerStatus) => {
			if (containerStatus.ready) {
			readyContainers++;
			}
			restartCount += containerStatus.restartCount;
		});
		}
	
			let cj_send_dailyemail = item.metadata.name;
			let rs = cj_send_dailyemail.match(/cj-prod-send-dailyemail-local-staging/g);		// localhos-microK8s

			if(rs){	// if matched()
			jobs_arr.push({
				name: { text: item.metadata.name, isSelector: true },
				duration: { text: restartCount },
				age: {
					text: timeAgo.format(item.status.startTime, 'round')
				}
			});	

			}

		}// end for 

		let jobsArr_lastItem = jobs_arr[jobs_arr.length - 1];		// look for LAST
		// console.log('======================= START: monitor-send-dailyemails.js');
		// console.log('LAST....name:....' + jobsArr_lastItem.name.text);
		// console.log('LAST....namespace:....' + jobsArr_lastItem.duration.text);
		// console.log('LAST....age:....' + jobsArr_lastItem.age.text);

		let age_str = jobsArr_lastItem.age.text;				
		
		// Using match with regEx, eg. [a minute ago], [2 minutes ago], [5 minutes ago], [10 minutes ago]...
		let matches_numeric = age_str.match(/2 minutes ago/g);		// [After tested 10 Rounds]: if more than 2 minutes, due to [timeAgo.format()] treat as ONE MINUTE while come to 42s & above. 
		if (!matches_numeric) {		
			let jobs_arr2 = new Object();
			jobs_arr2.status = "100";
			jobs_arr2.message = "JOB NAME: " + jobsArr_lastItem.name.text + ", Removing this last job from current list !!!";
			jobs_arr2.name = jobsArr_lastItem.name.text;
			jobs_arr2.duration = jobsArr_lastItem.duration.text;
			jobs_arr2.age = jobsArr_lastItem.age.text;
			
			// console.log('LAST Job......:', JSON.stringify(jobs_arr2, null))				
			// console.log('======================= END: monitor-send-dailyemails.js');

			// steps - DELETE()
			// const removed = await apis.batch.v1.namespaces(namespace).jobs(jobsArr_lastItem.name.text).delete();
			// console.log('Removed THIS JOB: ', removed);
			return JSON.stringify(jobs_arr2, null);
		}

		let obj = new Object();
		obj.status = "200";
		obj.message = "JOB NAME: " + jobsArr_lastItem.name.text + ", Current crondjob running smoothly as per minutes !!!";
		obj.name = jobsArr_lastItem.name.text;

		// console.log('LAST Job......:', JSON.stringify(obj, null))		
		// console.log('======================= END: monitor-send-dailyemails.js');
		return JSON.stringify(obj);

	} catch (error) {
		// logger(error, this);

		let obj = new Object();
		obj.status = "400";
		obj.message = error.message;
		return JSON.stringify(obj); 

	}

};

