/* /js/pages/professor/statistics.js */
(() => {
  'use strict';

  if (!('Chart' in window)) {
    console.error('Chart.js is not loaded. Include Chart UMD before this script.');
    return;
  }
  if (typeof window.getStatistics !== 'function') {
    console.error('getStatistics() is not defined.');
    return;
  }

  const LABEL_SUPERVISOR = 'Επιβλέπων';
  const LABEL_MEMBER = 'Μέλος';

  const elCompletion = document.getElementById('completionTimeChart');
  const elGrade = document.getElementById('averageGradeChart');
  const elTotals = document.getElementById('totalThesesChart');

  const nf = new Intl.NumberFormat('el-GR', { maximumFractionDigits: 2 });
  const format = (n) => nf.format(Number.isFinite(n) ? n : 0);

  function showError(canvasId, msg) {
    const canvas = document.getElementById(canvasId);
    const parent = canvas?.closest('.card-body');
    if (!parent) return;
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger my-2';
    alert.textContent = msg;
    parent.appendChild(alert);
  }

  function makeBarChart(ctx, { labels, data, yTitle, suggestedMax }) {
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          borderWidth: 1,
          backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 159, 64, 0.5)'],
          borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 159, 64, 1)']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax,
            title: { display: !!yTitle, text: yTitle }
          }
        }
      }
    });
  }

  function makeDoughnutChart(ctx, { labels, data }) {
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 159, 64, 0.5)'],
          borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 159, 64, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  Promise.resolve(window.getStatistics())
    .then((payload) => {
      const d = (payload && payload.data) || {};
      const stats = {
        avgCompletionDaysSupervised: Number(d.avgCompletionDaysSupervised ?? 0),
        avgCompletionDaysMember:     Number(d.avgCompletionDays ?? 0),
        avgGradeSupervised:          Number(d.avgGradeSupervised ?? 0),
        avgGradeMember:              Number(d.avgGrade ?? 0),
        totalSupervised:             Number(d.totalSupervised ?? 0),
        totalMember:                 Number(d.total ?? 0)
      };

      makeBarChart(elCompletion.getContext('2d'), {
        labels: [LABEL_SUPERVISOR, LABEL_MEMBER],
        data: [stats.avgCompletionDaysSupervised, stats.avgCompletionDaysMember],
        yTitle: 'Ημέρες',
        suggestedMax: Math.max(stats.avgCompletionDaysSupervised, stats.avgCompletionDaysMember) || 10
      });

      makeBarChart(elGrade.getContext('2d'), {
        labels: [LABEL_SUPERVISOR, LABEL_MEMBER],
        data: [stats.avgGradeSupervised, stats.avgGradeMember],
        yTitle: 'Βαθμός',
        suggestedMax: Math.max(10, stats.avgGradeSupervised, stats.avgGradeMember)
      });

      makeDoughnutChart(elTotals.getContext('2d'), {
        labels: [LABEL_SUPERVISOR, LABEL_MEMBER],
        data: [stats.totalSupervised, stats.totalMember]
      });
    })
    .catch((err) => {
      console.error('Σφάλμα φόρτωσης στατιστικών:', err);
      showError('completionTimeChart', 'Αποτυχία φόρτωσης στατιστικών για τον χρόνο ολοκλήρωσης.');
      showError('averageGradeChart', 'Αποτυχία φόρτωσης στατιστικών για τη βαθμολογία.');
      showError('totalThesesChart', 'Αποτυχία φόρτωσης στατιστικών για το πλήθος διπλωματικών.');
    });
})();
