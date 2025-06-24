// // src/pages/WorkSchedule.js
// import React, { useEffect, useState, useCallback, useMemo } from 'react';
// import { DndProvider, useDrag, useDrop } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import Modal from 'react-modal';
// import api from './api';
// import '../styles/WorkSchedule.css';

// const ITEM_TYPE = 'SHIFT';
// const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
// const HOURS = Array.from({ length: 10 }, (_, i) => 9 + i);

// // compute the next calendar date for a given weekday
// const computeNextDate = dayName => {
//   const dayMap = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
//   const today = new Date();
//   const diff = (dayMap[dayName] - today.getDay() + 7) % 7;
//   const target = new Date(today);
//   target.setDate(today.getDate() + diff);
//   return target.toISOString().split('T')[0];
// };

// Modal.setAppElement('#root');

// export default function WorkSchedule() {
//   const role = localStorage.getItem('role');          // 'manager' | 'admin' | 'employee'
//   const currentUsername = localStorage.getItem('username');
//   const authHeader = useMemo(() => ({
//     headers:{ Authorization:`Bearer ${localStorage.getItem('access')}` }
//   }), []);

//   // 🗓️ schedule we're editing
//   const [scheduleId, setScheduleId] = useState(null);

//   // grid of existing shifts: { "Monday-9": { id, employee:{username}, ... } }
//   const [grid, setGrid] = useState({});

//   // all employees for assignment dropdown
//   const [employees, setEmployees] = useState([]);

//   // drafts = pending changes until Save
//   // { "Mon-9": "alice", "Wed-12": null /* remove shift */ }
//   const [drafts, setDrafts] = useState({});

//   // swap & move modals (employees only)
//   const [swapModal, setSwapModal] = useState({
//     open:false, shift:null, newDate:'', newStart:'', newEnd:''
//   });
//   const [moveModal, setMoveModal] = useState({ open:false, shift:null });

//   // Load the first schedule, employees list, and initial grid
//   const reloadGrid = useCallback(() => {
//     api.get('/schedules/grid/', authHeader)
//       .then(res => setGrid(res.data))
//       .catch(console.error);
//   }, [authHeader]);

//   useEffect(() => {
//     // 1) load schedules, pick first
//     api.get('/schedules/', authHeader)
//       .then(res => {
//         if (res.data.length>0) setScheduleId(res.data[0].id);
//       })
//       .catch(console.error);

//     // 2) employees & grid
//     api.get('/employees/', authHeader).then(r=>setEmployees(r.data)).catch(console.error);
//     reloadGrid();
//   }, [reloadGrid, authHeader]);

//   // draft a change (no API call yet)
//   const assignDraft = (day, hour, usernameOrNull) => {
//     const key = `${day}-${hour}`;
//     setDrafts(d => ({ ...d, [key]: usernameOrNull }));
//   };

//   // Persist all drafts at once
//   const saveChanges = () => {
//   console.log('▶ Saving changes, scheduleId=', scheduleId, 'drafts=', drafts)

//   if (!scheduleId) {
//     alert('Still loading schedule…')
//     return
//   }

//   const ops = Object.entries(drafts).map(([key, username]) => {
//     console.log('   op:', key, '→', username)
//     const [day, hourStr] = key.split('-')
//     const hour = parseInt(hourStr, 10)
//     const existing = grid[key]

//     if (username && !existing) {
//       console.log('   → CREATE shift for', username, 'at', day, hour)
//       return api.post('/shifts/', {
//         schedule:   scheduleId,
//         date:       computeNextDate(day),
//         start_time: `${hour}:00`,
//         end_time:   `${hour+1}:00`,
//         employee:   username,
//       }, authHeader)
//     } else if (!username && existing) {
//       console.log('   → DELETE shift id', existing.id)
//       return api.delete(`/shifts/${existing.id}/`, authHeader)
//     } else {
//       console.log('   → SKIP')
//       return Promise.resolve()
//     }
//   })

//   if (ops.length === 0) {
//     alert('No changes to save')
//     return
//   }

//   Promise.all(ops)
//     .then(() => {
//       console.log('All done!')
//       setDrafts({})
//       reloadGrid()
//     })
//     .catch(err => {
//       console.error('Error saving:', err.response?.data)
//       alert('Server error:\n' + JSON.stringify(err.response?.data, null, 2))
//     })
// }

//   // shift-swap & move-me for employees
//   const submitSwap = () => {
//     api.post('/swap-requests/', {
//       shift:           swapModal.shift.id,
//       requested_date:  swapModal.newDate,
//       requested_start: swapModal.newStart,
//       requested_end:   swapModal.newEnd,
//     }, authHeader)
//     .then(()=>{ reloadGrid(); setSwapModal({open:false}); })
//     .catch(console.error);
//   };
//   const performMove = dir => {
//     api.post(`/shifts/${moveModal.shift.id}/move_me/`, { direction:dir }, authHeader)
//       .then(()=>{ reloadGrid(); setMoveModal({open:false}); })
//       .catch(console.error);
//   };

//   // draggable pill component
//   function ShiftPill({ shift }) {
//     const [{ isDragging }, drag] = useDrag({
//       type: ITEM_TYPE,
//       item: { id: shift.id },
//       collect: m => ({ isDragging: !!m.isDragging() })
//     });
//     return (
//       <div
//         ref={drag}
//         className={`shift-pill pill-${shift.shift_type}`}
//         style={{ opacity: isDragging?0.5:1 }}
//       >
//         {shift.employee.username}
//       </div>
//     );
//   }

//   // each table cell
//   function Cell({ day, hour }) {
//     const key = `${day}-${hour}`;
//     const shift = grid[key];
//     const isManager = role==='manager'||role==='admin';
//     const isEmployee = role==='employee';
//     const isMine = shift?.employee.username===currentUsername;

//     const [, drop] = useDrop({
//       accept: ITEM_TYPE,
//       canDrop: ()=>isManager,
//       drop: item => assignDraft(day, hour, grid[`${day}-${hour}`] ? null : item.id)
//     });

//     // MANAGER / ADMIN
//     if (isManager) {
//       return (
//         <td ref={drop} className="cell">
//           {shift
//             ? <>
//                 <ShiftPill shift={shift} />
//                 <button
//                   className="unassign-btn"
//                   title="Unassign"
//                   onClick={()=>assignDraft(day,hour,null)}
//                 >✖</button>
//               </>
//             : <select
//                 value={drafts[key]||''}
//                 onChange={e=>assignDraft(day,hour,e.target.value)}
//               >
//                 <option value="" disabled>—</option>
//                 {employees.map(emp=>
//                   <option key={emp.id} value={emp.username}>
//                     {emp.username}
//                   </option>
//                 )}
//               </select>
//           }
//         </td>
//       );
//     }

//     // EMPLOYEE
//     if (isEmployee) {
//       if (!shift) return <td className="cell"/>;
//       return (
//         <td className="cell">
//           <ShiftPill shift={shift} />
//           {isMine && (
//             <div className="cell-actions">
//               <button onClick={()=>setMoveModal({open:true,shift})} className="small-btn">Move Me</button>
//               <button onClick={()=>setSwapModal({
//                   open:true,
//                   shift,
//                   newDate:shift.date,
//                   newStart:shift.start_time,
//                   newEnd:shift.end_time
//                 })}
//                 className="small-btn"
//               >Request Swap</button>
//             </div>
//           )}
//         </td>
//       );
//     }

//     // otherwise empty
//     return <td className="cell"/>;
//   }

//   return (
//     <DndProvider backend={HTML5Backend}>
//       <div className="work-schedule">
//         <div className="filter-row">
//           <label>View:</label>
//           <select
//             onChange={e => {
//               // TODO: call /schedules/grid/?filter=my|team
//               alert('Filter not implemented in this demo');
//             }}
//           >
//             <option value="all">All Shifts</option>
//             <option value="team">Team Shifts</option>
//             <option value="mine">My Shifts</option>
//           </select>
//         </div>
//         <table className="schedule-grid">
//           <thead>
//             <tr>
//               <th className="hour-cell">Hour \ Day</th>
//               {DAYS.map(d=> <th key={d}>{d}</th>)}
//             </tr>
//           </thead>
//           <tbody>
//             {HOURS.map(h=>(
//               <tr key={h}>
//                 <td className="hour-cell">{h}:00</td>
//                 {DAYS.map(d=>
//                   <Cell key={`${d}-${h}`} day={d} hour={h}/>
//                 )}
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <button
//           className="save-btn"
//           onClick={saveChanges}
//           disabled={!scheduleId}
//           title={!scheduleId?'Loading schedule…':'Save Changes'}
//         >
//           Save Changes
//         </button>

//         {/* Swap Modal */}
//         <Modal
//           isOpen={swapModal.open}
//           onRequestClose={()=>setSwapModal({open:false})}
//           className="modal"
//         >
//           <h2>Request Swap</h2>
//           <label>Date:</label>
//           <input
//             type="date"
//             value={swapModal.newDate}
//             onChange={e=>setSwapModal(m=>({...m,newDate:e.target.value}))}
//           />
//           <label>Start:</label>
//           <input
//             type="time"
//             value={swapModal.newStart}
//             onChange={e=>setSwapModal(m=>({...m,newStart:e.target.value}))}
//           />
//           <label>End:</label>
//           <input
//             type="time"
//             value={swapModal.newEnd}
//             onChange={e=>setSwapModal(m=>({...m,newEnd:e.target.value}))}
//           />
//           <button onClick={submitSwap}>Submit</button>
//           <button onClick={()=>setSwapModal({open:false})}>Cancel</button>
//         </Modal>

//         {/* Move Modal */}
//         <Modal
//           isOpen={moveModal.open}
//           onRequestClose={()=>setMoveModal({open:false})}
//           className="modal"
//         >
//           <h2>Move My Shift</h2>
//           <button onClick={()=>performMove('up')}>+1h</button>
//           <button onClick={()=>performMove('down')}>−1h</button>
//           <button onClick={()=>setMoveModal({open:false})}>Cancel</button>
//         </Modal>
//       </div>
//     </DndProvider>
//   );
// }
