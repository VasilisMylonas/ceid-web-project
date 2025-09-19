document.addEventListener('DOMContentLoaded', async () => {
  // === Configuration ===
  const CURRENT_USER_NAME = 'Δρ. Α. Γεωργίου';

  const state = {
    currentUser: { name: '', professorId: null },
    theses: [],
    loaded: false,
  };

  // === Server -> UI status mapping (Greek only) ===
  // Δείχνουμε ΠΑΝΤΑ ελληνικά στο UI, ανεξάρτητα από τι γυρίζει ο server
  const STATUS_BADGES = {
    'Ενεργή': 'bg-primary',
    'Περατωμένη': 'bg-success',
    'Υπό Ανάθεση': 'bg-warning text-dark',
    'Υπό Εξέταση': 'bg-info text-dark',
    'Ακυρωμένη': 'bg-danger',
  };




  // === DOM Elements ===
  const tableBody = document.getElementById('theses-table-body');
  const filterForm = document.getElementById('filter-form');
  const detailsModalEl = document.getElementById('thesis-details-modal');
  const detailsModal = new bootstrap.Modal(detailsModalEl);

  // === Professor names cache & API ===
  const professorCache = new Map();

  async function loadProfessor(professorId) {
    if (!professorId) return null;
    if (professorCache.has(professorId)) return professorCache.get(professorId);
    try {
      const res = await request('GET', `${BASE_URL}/v1/professors/${professorId}`);
      const data = res?.data || res || {};
      const prof = {
        id: Number(data?.id ?? professorId),
        name: data?.name || data?.fullName || null,
        email: data?.email || null
      };
      professorCache.set(professorId, prof);
      return prof;
    } catch (err) {
      console.error('Failed to load professor', professorId, err);
      return null;
    }
  }


  async function getProfessorNameById(professorId) {
    const prof = await loadProfessor(professorId);
    return prof?.name || null;
  }

  // === Normalizer: adapt server objects to this UI's structure ===
  function normalizeThesis(srv) {
    const profId = state.currentUser.professorId;
    const amSupervisor = profId != null && Number(srv?.supervisorId) === Number(profId);

    return {
      id: Number(srv?.id),
      title: srv?.title ?? srv?.topic ?? '(Untitled)',
      student: srv?.student ?? srv?.studentName ?? '',
      myRole: amSupervisor ? 'supervisor' : 'member',
      status: Name.ofThesisStatus(srv?.status),
      assignmentDate: srv?.assignmentDate ?? srv?.startDate ?? null,

      // Supervisor στοιχεία (αν δίνει το API)
      supervisorId: Number(srv?.supervisorId) || null,
      supervisorName: srv?.supervisor?.name || srv?.supervisorName || null,

      // Optional fields με ασφαλή defaults
      committee: Array.isArray(srv?.committee) ? srv.committee : [],
      timeline: Array.isArray(srv?.timeline) ? srv.timeline : [],
      notes: Array.isArray(srv?.notes) ? srv.notes : [],
      presentationDetailsFilled: !!srv?.presentationDetailsFilled,
      gradingActive: !!srv?.gradingActive,
      grades: srv?.grades ?? {},
      finalGrade: srv?.finalGrade ?? null,
      repoLink: srv?.repoLink ?? '#',
      gradingFormLink: srv?.gradingFormLink ?? '#',
      draftLink: srv?.draftLink ?? '#'
    };
  }

  // === Invitations -> επιτροπή (με ελληνικά status) ===
  function translateInvitationStatus(response, responseDateISO) {
    const date = responseDateISO ? new Date(responseDateISO).toLocaleDateString('el-GR') : null;
    if (response === 'accepted') return { text: 'Αποδέχτηκε', cls: 'text-success', date };
    if (response === 'pending' || response == null) return { text: 'Εκκρεμεί', cls: 'text-warning', date };
    return { text: 'Απέρριψε', cls: 'text-danger', date };
  }

  // === Load committee invitations for one thesis AND prepend supervisor ===
  async function loadThesisCommittee(thesis) {
    try {
      const res = await request('GET', `${BASE_URL}/v1/theses/${thesis.id}/invitations`);
      const raw = res?.data ?? [];

      const members = await Promise.all(
        raw.map(async inv => {
          const name = await getProfessorNameById(Number(inv.professorId));
          const t = translateInvitationStatus(inv.response, inv.responseDate);
          return {
            id: Number(inv.id),
            role: 'Μέλος',
            professorId: Number(inv.professorId),
            name: name || `(ID ${inv.professorId})`,
            status: t.text,
            statusClass: t.cls,
            date: t.date
          };
        })
      );

      // Supervisor first
      let supervisorName = thesis.supervisorName;
      if (!supervisorName && thesis.supervisorId) {
        supervisorName = await getProfessorNameById(thesis.supervisorId);
      }
      const supervisorEntry = (thesis.supervisorId || supervisorName) ? [{
        id: `supervisor-${thesis.id}`,
        role: 'Επιβλέπων',
        professorId: thesis.supervisorId || null,
        name: supervisorName || 'Επιβλέπων',
        status: '—',
        statusClass: '',
        date: null
      }] : [];

      return [...supervisorEntry, ...members];
    } catch (err) {
      console.error(`Failed to load committee for thesis ${thesis?.id}:`, err);
      // Fallback: προσπάθησε να κρατήσεις ό,τι είχε ήδη το thesis
      return thesis?.committee || [];
    }
  }

  // === Data loaders (marking API calls clearly) ===

  async function loadTheses() {
    try {
      const res = await getAllProfessorTheses(state.currentUser.professorId);
      const raw = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
      state.theses = raw.map(normalizeThesis);

      // Για κάθε thesis, φόρτωσε και την επιτροπή από invitations
      for (const thesis of state.theses) {
        thesis.committee = await loadThesisCommittee(thesis);
      }

      state.loaded = true;
    } catch (err) {
      console.error('Failed to load theses:', err);
  
      state.loaded = true;
    }
  }

  async function loadProfile() {
    try {
      const res = await getProfile(); // -> payload προφίλ
      const u = res?.data || res; // tolerate {data:{...}} ή {...}
      state.currentUser.name = u?.name || CURRENT_USER_NAME || '';
      state.currentUser.professorId = Number(u?.Professor?.id) || null;
      return state.currentUser;
    } catch (err) {
      console.error('Failed to load profile:', err);
      return state.currentUser; // κράτα default
    }
  }

  async function loadThesisTimeline(thesisId) {
  try {
    const res = await getThesisTimeline(thesisId);
    const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);

    return raw.map(ev => {
      const oldStatus = Name.ofThesisStatus(ev.oldStatus);
      const newStatus = Name.ofThesisStatus(ev.newStatus);
      const date = new Date(ev.changedAt).toLocaleString('el-GR');
      return {
        event: `${oldStatus} → ${newStatus}`,
        date,
      };
    });
  } catch (err) {
    console.error(`Failed to load timeline for thesis ${thesisId}`, err);
    return [];
  }
}

  // === UI renderers ===

  function renderTable() {
    const statusFilter = document.getElementById('filter-status').value; // πρέπει τα option values να είναι ελληνικά!
    const roleFilter = document.getElementById('filter-role').value;

    const filtered = (state.theses || []).filter(thesis =>
      (statusFilter === 'all' || thesis.status === statusFilter) &&
      (roleFilter === 'all' || thesis.myRole === roleFilter)
    );

    tableBody.innerHTML = '';
    filtered.forEach(thesis => {
      const row = document.createElement('tr');
      row.dataset.thesisId = thesis.id;
      const badgeClass = STATUS_BADGES[thesis.status] || 'bg-secondary';

      row.innerHTML = `
        <td>${thesis.title}</td>
        <td>${thesis.student}</td>
        <td>${thesis.myRole === 'supervisor' ? 'Επιβλέπων' : 'Μέλος Επιτροπής'}</td>
        <td><span class="badge ${badgeClass}">${thesis.status}</span></td>
        <td class="text-center"><button class="btn btn-sm btn-primary manage-btn">Διαχείριση</button></td>
      `;
      tableBody.appendChild(row);
    });
  }

async function populateAndShowModal(thesisId) {
  const thesis = (state.theses || []).find(t => t.id == thesisId);
  if (!thesis) return;

  detailsModalEl.querySelector('.modal-body').dataset.thesisId = thesis.id;

  // Reset sections
  document.querySelectorAll('.action-section, .supervisor-action, #grading-section')
    .forEach(el => el.style.display = 'none');

  // Common info
  document.getElementById('thesis-modal-title').textContent = thesis.title;
  document.getElementById('modal-student-name').textContent = thesis.student;

  // Committee
  document.getElementById('modal-committee-list').innerHTML =
    (thesis.committee || []).map(m => {
      const statusSpan = m.status && m.status !== '—'
        ? `: <span class="${m.statusClass}">${m.status}${m.date ? ` (${m.date})` : ''}</span>`
        : '';
      return `<li>${m.name} (${m.role})${statusSpan}</li>`;
    }).join('');

  // === Load timeline async ===
  document.getElementById('modal-timeline').innerHTML = '<li class="list-group-item">Φόρτωση...</li>';
  loadThesisTimeline(thesis.id).then(timeline => {
    thesis.timeline = timeline; // cache it for later reuse
    document.getElementById('modal-timeline').innerHTML =
      timeline.map(t => `<li class="list-group-item">${t.event} - ${t.date}</li>`).join('') || 
      '<li class="list-group-item">Δεν υπάρχουν αλλαγές κατάστασης.</li>';
  });

  // Role-specific actions
  const isSupervisor = thesis.myRole === 'supervisor';
  switch (thesis.status) {
    case 'Υπό Ανάθεση':
      _showUnderAssignmentActions(thesis, isSupervisor); break;
    case 'Ενεργή':
      _showActiveActions(thesis, isSupervisor); break;
    case 'Υπό Εξέταση':
      _showUnderReviewActions(thesis, isSupervisor); break;
    case 'Περατωμένη':
      _showCompletedActions(thesis); break;
  }

  detailsModal.show();
}

  // --- Modal helper sections ---
  function _showUnderAssignmentActions(thesis, isSupervisor) {
    const section = document.getElementById('actions-under-assignment');
    section.style.display = 'block';

    // Εμφάνιση κατάστασης μόνο για μέλη (όχι Επιβλέπων)
    const committeeStatusDiv = document.getElementById('modal-committee-status');
    committeeStatusDiv.innerHTML = (thesis.committee || [])
      .filter(m => m.role !== 'Επιβλέπων')
      .map(m => {
        const statusText = m.status && m.status !== '—'
          ? `${m.status}${m.date ? ` (${m.date})` : ''}`
          : '—';
        const cls = m.statusClass || '';
        return `<p>${m.name}: <span class="${cls}">${statusText}</span></p>`;
      }).join('');

    if (isSupervisor) {
      document.getElementById('supervisor-actions-under-assignment').style.display = 'block';
    }
  }

  function _showActiveActions(thesis, isSupervisor) {
    const section = document.getElementById('actions-active');
    section.style.display = 'block';

    document.getElementById('modal-notes-list').innerHTML =
      (thesis.notes || []).map(n => `<p class="fst-italic border-start ps-2">"${n.text}"</p>`).join('');

    if (isSupervisor) {
      document.getElementById('supervisor-actions-active').style.display = 'block';
      const twoYearsAgo = new Date(); twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      const assigned = thesis.assignmentDate ? new Date(thesis.assignmentDate) : null;
      document.getElementById('cancel-thesis-section').style.display =
        assigned && assigned < twoYearsAgo ? 'block' : 'none';
    }
  }

  function _showUnderReviewActions(thesis, isSupervisor) {
    const section = document.getElementById('actions-under-review');
    section.style.display = 'block';
    document.getElementById('view-draft-link').href = thesis.draftLink || '#';

    if (isSupervisor) {
      document.getElementById('supervisor-actions-under-review').style.display = 'block';
      // Αν δεν έχουν συμπληρωθεί στοιχεία παρουσίασης, απενεργοποίησε το κουμπί
      document.getElementById('generate-announcement-btn').disabled = !thesis.presentationDetailsFilled;
      // Αν grading έχει ήδη ενεργοποιηθεί, κρύψε το κουμπί
      document.getElementById('activate-grading-btn').style.display = thesis.gradingActive ? 'none' : 'inline-block';
    }

    if (thesis.gradingActive) {
      document.getElementById('grading-section').style.display = 'block';
      const gradingBody = document.getElementById('grading-table-body');
      gradingBody.innerHTML = Object.entries(thesis.grades || {}).map(([prof, grade]) => {
        const actionBtn = (prof === (state.currentUser.name || CURRENT_USER_NAME)) && (grade == null)
          ? '<button class="btn btn-sm btn-success grade-btn">Βαθμολόγησε</button>'
          : '';
        return `<tr><td>${prof}</td><td>${grade ?? 'Εκκρεμεί'}</td><td>${actionBtn}</td></tr>`;
      }).join('');
    }
  }

  function _showCompletedActions(thesis) {
    const section = document.getElementById('actions-completed');
    section.style.display = 'block';
    document.getElementById('modal-final-grade').textContent = thesis.finalGrade ?? 'N/A';
    document.getElementById('modal-repo-link').href = thesis.repoLink || '#';
    document.getElementById('modal-grading-form-link').href = thesis.gradingFormLink || '#';
  }

  // === Event Listeners ===

  filterForm.addEventListener('submit', e => {
    e.preventDefault();
    renderTable();
  });

  // "Manage" button click
  tableBody.addEventListener('click', e => {
    if (e.target.classList.contains('manage-btn')) {
      const thesisId = e.target.closest('tr').dataset.thesisId;
      populateAndShowModal(thesisId);
    }
  });

  // Modal actions (notes, status changes, grading activate)
  detailsModalEl.addEventListener('click', e => {
    const thesisId = detailsModalEl.querySelector('.modal-body').dataset.thesisId;
    const thesis = (state.theses || []).find(t => t.id == thesisId);
    if (!thesis) return;

    if (e.target.id === 'add-note-btn') {
      const noteInput = document.getElementById('modal-new-note');
      if (noteInput.value) {
        thesis.notes = thesis.notes || [];
        thesis.notes.push({ text: noteInput.value });
        noteInput.value = '';
        // TODO: API CALL — request('POST', `${BASE_URL}/v1/thesis/${thesis.id}/notes`, { text })
        populateAndShowModal(thesisId);
      }
    } else if (e.target.id === 'change-status-to-review-btn') {
      thesis.status = 'Υπό Εξέταση';
      // TODO: API CALL — request('PATCH', `${BASE_URL}/v1/thesis/${thesis.id}`, { status: 'under_review' })
      detailsModal.hide();
      renderTable();
    } else if (e.target.id === 'activate-grading-btn') {
      thesis.gradingActive = true;
      // TODO: API CALL — request('POST', `${BASE_URL}/v1/thesis/${thesis.id}/grading/activate`)
      populateAndShowModal(thesisId);
    }
  });

  // === Boot ===
  await loadProfile();    // <-- sets state.currentUser.name/professorId
  await loadTheses();     // <-- uses normalizeThesis() and enriches committee via loadThesisCommittee()
  renderTable();
});
