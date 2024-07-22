'use strict';
// const cors = require('micro-cors')();
const controller = require('../../controller/index');


const {send} = require('micro')
const {withNamespace, router, get, post} = require('microrouter');
const oldApi = withNamespace('/api/v1')


const health = async (req, res) => {
	const healthy = await controller.health.health();
	send(res, 200, healthy);
};

const jobs = async (req, res) => {
	const jobs = await controller.jobs.jobs(req.params.method, req.query.namespace);
	send(res, 200, jobs);

};


const notFound = async (req, res) => {
	send(res, 404, 'HTTP 404 - Endpoint not found');
};


module.exports = router(

	oldApi(get('/kubeapi/:method', jobs)),				
	oldApi(get('/health', health)),					


	oldApi(get('/*', notFound)),

);
