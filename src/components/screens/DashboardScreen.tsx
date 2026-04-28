import React, { useEffect, useRef } from 'react';
import { Report } from '../../types';
import { getSectorStyle } from '../../utils';

declare const Chart: any;

interface DashboardScreenProps {
  reports: Report[];
  myTokens: string[];
}

const STATUS_LEVELS: Record<string, number> = {
  Received: 0,
  Review: 1,
  Verified: 2,
  Actioned: 3,
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  reports,
  myTokens,
}) => {
  const donutRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLCanvasElement>(null);

  const myReports = reports.filter((r) => myTokens.includes(r.token));

  useEffect(() => {
    let donutChart: any = null;
    let barChart: any = null;

    if (donutRef.current) {
      const counts = {
        Education: 0,
        Healthcare: 0,
        'BBMP/Infra': 0,
        'Police/Other': 0,
      };
      reports.forEach((r) => {
        if (counts[r.sector] !== undefined) counts[r.sector]++;
      });

      donutChart = new Chart(donutRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Education', 'Healthcare', 'BBMP/Infra', 'Police/Other'],
          datasets: [
            {
              data: [
                counts['Education'],
                counts['Healthcare'],
                counts['BBMP/Infra'],
                counts['Police/Other'],
              ],
              backgroundColor: ['#3D9BFF', '#00C97A', '#FFB800', '#FF2D2D'],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#a0a0a0', font: { family: 'Inter' } },
            },
          },
        },
      });
    }

    if (barRef.current) {
      barChart = new Chart(barRef.current, {
        type: 'bar',
        data: {
          labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Now'],
          datasets: [
            {
              label: 'Reports',
              data: [12, 19, 13, 17, 21, reports.length],
              backgroundColor: 'rgba(255, 45, 45, 0.8)',
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#a0a0a0' },
            },
            x: {
              grid: { display: false },
              ticks: { color: '#a0a0a0' },
            },
          },
          plugins: { legend: { display: false } },
        },
      });
    }

    return () => {
      if (donutChart) donutChart.destroy();
      if (barChart) barChart.destroy();
    };
  }, [reports]);

  const officials = [
    { handle: '@DEO_Bengaluru', val: 23 },
    { handle: '@BBMPCOMM', val: 15 },
    { handle: '@CMO_Karnataka', val: 8 },
    { handle: '@BlrCityPolice', val: 55 },
  ];

  return (
    <div className="screen active">
      <div className="screen-inner">
        <h2 className="screen-title"><span className="screen-title-icon">📊</span> Impact Dashboard</h2>

        <p className="section-label">My <span>Reports</span></p>
        <div id="my-reports-list">
          {myReports.length === 0 ? (
            <div className="g-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--muted-lt)' }}>
              No reports submitted yet.
            </div>
          ) : (
            myReports.map((r) => {
              const style = getSectorStyle(r.sector);
              const level = STATUS_LEVELS[r.status] || 0;
              return (
                <div key={r.id} className="g-card" style={{ padding: '20px', marginBottom: '16px' }}>
                  <div className="flex justify-between items-center mb-2">
                    <div style={{ fontWeight: 800, fontSize: '18px' }}>{r.id}</div>
                    <div className={`pill ${style.cls}`}>{style.text}</div>
                  </div>
                  <div className="token-box" style={{ fontSize: '14px', padding: '8px 12px', margin: '4px 0 16px 0' }}>{r.token}</div>

                  <div className="stepper">
                    {['Received', 'Review', 'Verified', 'Actioned'].map((step, idx) => {
                      const active = idx <= level;
                      return (
                        <div key={step} className={`step ${active ? 'active' : ''}`}>
                          <div className="step-circle"></div>
                          {step}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="section-label" style={{ marginTop: '24px' }}>City <span>Stats</span></p>
        <div className="chart-container">
          <canvas id="donutChart" ref={donutRef} width="400" height="200"></canvas>
        </div>
        <div className="chart-container">
          <canvas id="barChart" ref={barRef} width="400" height="200"></canvas>
        </div>

        <p className="section-label" style={{ marginTop: '24px' }}>Officials <span>Tracker</span></p>
        <div className="g-card p-4">
          <table className="officials-table">
            <thead>
              <tr>
                <th>Department / Official</th>
                <th>Action Rate</th>
              </tr>
            </thead>
            <tbody>
              {officials.map((off) => (
                <tr key={off.handle}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--white)' }}>{off.handle}</div>
                    <div style={{ fontSize: '10px' }}>Dept</div>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <div className="shame-bar">
                        <div
                          className="shame-fill"
                          style={{
                            width: `${off.val}%`,
                            backgroundColor: off.val >= 50 ? 'var(--amber)' : 'var(--red)',
                          }}
                        ></div>
                      </div>
                      {off.val}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
