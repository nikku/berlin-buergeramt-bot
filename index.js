// Imports
require('dotenv').config()
const got = require('got');
const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler')

const getAvailableAppointments = require('./get-available-appointments');
const getBookingPageHtml = require('./get-booking-page-html');
const sendNotification = require('./send-notification');

// Setup simple scheduler
const scheduler = new ToadScheduler()
const checkForAppointmentsTask = new AsyncTask('checkForAppointments', checkForAppointments, handleErrors)
const job = new SimpleIntervalJob({ minutes: process.env.CHECK_INTERVAL_MINUTES, runImmediately: true }, checkForAppointmentsTask)
scheduler.addSimpleIntervalJob(job)

async function checkForAppointments() {

  let bookingPageHtml = await getBookingPageHtml();
  const dates = getAvailableAppointments(bookingPageHtml);

  if (dates.length > 0) {
    const message = `Appointments are available now!`
    await sendNotification({ type: 'info', message, url: process.env.BOOKING_URL })
  }

  const date = new Date().toISOString();
  const message = `${dates.length} appointments found.`
  console.log(`${date} ${message}`)

  // Ping healthchecks.io
  if (process.env.HEALTHCHECKS_IO_TOKEN) {
    await got(`https://hc-ping.com/${process.env.HEALTHCHECKS_IO_TOKEN}`, { method: 'POST', body: message })
  }
};

async function handleErrors(err) {
  console.error(err);
  await sendNotification('error', JSON.stringify(err));
}
