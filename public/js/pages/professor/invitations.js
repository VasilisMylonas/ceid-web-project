(function () {
  const $list = document.getElementById("list");
  const $tpl = document.getElementById("invitation-item");
  const $status = document.getElementById("status");
  const $empty = document.getElementById("empty");
  const $error = document.getElementById("error");

  let isLoading = false;

  const setLoading = (on, text = "Φόρτωση προσκλήσεων…") => {
    $status.textContent = on ? text : "";
    $status.hidden = !on;
  };

  const showError = (msg = "Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.") => {
    $error.textContent = msg;
    $error.hidden = false;
  };

  const hideBanners = () => {
    $error.hidden = true;
    $empty.hidden = true;
  };

  async function fetchThesis(thesisId) {
    try {
      const res = await getThesisDetails(thesisId);
      const payload = res?.success ? res.data : res?.data ?? null;
      return (payload && payload.data) ? payload.data : payload;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  function renderInvitation(invite, thesis) {
    const node = $tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = invite.id;

    node.querySelector('[data-field="student"]').textContent = thesis?.student ?? "—";
    node.querySelector('[data-field="topic"]').textContent = thesis?.topic ?? "—";
    node.querySelector('[data-field="supervisor"]').textContent = thesis?.supervisor ?? "—";
    node.querySelector('[data-field="createdAt"]').textContent = fmtDateTime(invite.createdAt);
    node.querySelector('[data-field="topicSummary"]').textContent = thesis?.topicSummary ?? "—";

    const pill = node.querySelector('[data-field="state"]');
    pill.classList.remove("ok", "err");
    pill.textContent = Name.ofInvitationResponse(invite.response);

    const $accept = node.querySelector(".accept");
    const $reject = node.querySelector(".reject");

    const setBusy = (busy) => {
      $accept.disabled = busy;
      $reject.disabled = busy;
      if (busy) {
        if (!$accept.dataset.label) $accept.dataset.label = $accept.textContent;
        if (!$reject.dataset.label) $reject.dataset.label = $reject.textContent;
        $accept.textContent = "Αποστολή…";
      } else {
        if ($accept.dataset.label) $accept.textContent = $accept.dataset.label;
        if ($reject.dataset.label) $reject.textContent = $reject.dataset.label;
      }
    };

    $accept.addEventListener("click", async () => {
      hideBanners();
      try {
        setBusy(true);
        await respondToInvitation(invite.id, "accepted");
        await loadInvitations();
      } catch (err) {
        console.error(err);
        showError("Αποτυχία αποδοχής. Προσπαθήστε ξανά.");
      } finally {
        setBusy(false);
      }
    });

    $reject.addEventListener("click", async () => {
      hideBanners();
      try {
        setBusy(true);
        await respondToInvitation(invite.id, "declined");
        await loadInvitations();
      } catch (err) {
        console.error(err);
        showError("Αποτυχία απόρριψης. Προσπαθήστε ξανά.");
      } finally {
        setBusy(false);
      }
    });

    return node;
  }

  async function loadInvitations() {
    if (isLoading) return;
    isLoading = true;
    setLoading(true);
    hideBanners();
    $list.innerHTML = "";
    try {
      const res = await getMyInvitations();
      const payload = res?.success ? res.data : res?.data ?? [];
      const pending = Array.isArray(payload?.data) ? payload.data : payload;

      if (!pending.length) {
        $empty.hidden = false;
        $list.hidden = true;
        return;
      }

      const nodes = await Promise.all(
        pending.map(async (inv) => {
          const thesis = inv.thesisId ? await fetchThesis(inv.thesisId) : null;
          return renderInvitation(inv, thesis);
        })
      );

      const frag = document.createDocumentFragment();
      nodes.forEach(n => frag.appendChild(n));
      $list.appendChild(frag);

      $list.hidden = false;
    } catch (err) {
      console.error(err);
      showError("Αποτυχία φόρτωσης προσκλήσεων.");
      $list.hidden = true;
    } finally {
      setLoading(false);
      isLoading = false;
    }
  }

  loadInvitations();
})();
