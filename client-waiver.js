(function initClientWaiverPage() {
  const form = document.getElementById("client-waiver-form");
  const feedbackNode = document.getElementById("client-waiver-feedback");
  const signatureCanvas = document.getElementById("waiver-signature-pad");
  const signatureClearButton = document.getElementById("waiver-signature-clear");
  const signatureFeedbackNode = document.getElementById("waiver-signature-feedback");
  const returnLink = document.getElementById("waiver-return-link");
  const DRAFT_KEY = "legacy-account-registration-draft:v1";
  const WAIVER_STATE_KEY = "legacy-client-waiver-state:v1";

  if (!(form instanceof HTMLFormElement) || !(signatureCanvas instanceof HTMLCanvasElement)) {
    return;
  }

  function readSessionJson(key) {
    try {
      const raw = window.sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function writeSessionJson(key, value) {
    try {
      if (value) {
        window.sessionStorage.setItem(key, JSON.stringify(value));
      } else {
        window.sessionStorage.removeItem(key);
      }
    } catch (_) {
      // Ignore storage failures.
    }
  }

  function cleanText(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/gu, " ");
  }

  function normalizeEmail(value) {
    return cleanText(value).toLowerCase();
  }

  function serializeForm() {
    const values = {};
    const formData = new FormData(form);
    formData.forEach((value, key) => {
      if (values[key]) {
        if (Array.isArray(values[key])) {
          values[key].push(String(value));
        } else {
          values[key] = [values[key], String(value)];
        }
      } else {
        values[key] = String(value);
      }
    });
    return values;
  }

  function calculateAge(dateOfBirthValue) {
    const dob = new Date(`${dateOfBirthValue}T00:00:00`);
    if (Number.isNaN(dob.getTime())) {
      return "";
    }

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDelta = today.getMonth() - dob.getMonth();
    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) {
      age -= 1;
    }
    return age > 0 ? String(age) : "";
  }

  function getRegistrationContext() {
    const draft = readSessionJson(DRAFT_KEY);
    const values = draft?.values && typeof draft.values === "object" ? draft.values : {};
    const dateOfBirth = cleanText(values.clientBirthday);

    return {
      fullName: cleanText(values.clientFullName),
      email: normalizeEmail(values.clientEmailAddress),
      phone: cleanText(values.clientPhone),
      icPassportNo: cleanText(values.clientIcPassportNo),
      dateOfBirth,
      age: calculateAge(dateOfBirth),
      gender: cleanText(values.clientGender),
      occupation: cleanText(values.clientOccupation),
      activityStyle: cleanText(values.clientActivityStyle),
      homeAddress: cleanText(values.clientHomeAddress),
      emergencyContactName: cleanText(values.clientEmergencyName),
      emergencyContactRelationship: cleanText(values.clientEmergencyRelationship),
      emergencyContactPhone: cleanText(values.clientEmergencyPhone),
      preferredCoachId: cleanText(values.clientPreferredCoachId),
    };
  }

  const finalDeclarationField = form.elements.namedItem("finalDeclarationName");
  const registrationContext = getRegistrationContext();
  if (finalDeclarationField instanceof HTMLInputElement && registrationContext.fullName && !cleanText(finalDeclarationField.value)) {
    finalDeclarationField.value = registrationContext.fullName;
  }

  function closeWaiverWindow() {
    if (window.opener && !window.opener.closed) {
      window.close();
      return;
    }

    const fallbackUrl = new URL("./account.html?role=client", window.location.href);
    const referrer = String(document.referrer || "");
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer, window.location.href);
        const isSameOrigin = referrerUrl.origin === window.location.origin;
        const isAccountPage = /\/account\.html(?:$|\?)/u.test(referrerUrl.pathname + referrerUrl.search);
        if (isSameOrigin && isAccountPage && window.history.length > 1) {
          window.history.back();
          return;
        }
      } catch (_) {
        // Ignore malformed referrers and fall back to the account page.
      }
    }

    window.location.href = fallbackUrl.toString();
  }

  if (returnLink instanceof HTMLAnchorElement) {
    returnLink.addEventListener("click", (event) => {
      event.preventDefault();
      closeWaiverWindow();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !event.defaultPrevented) {
      event.preventDefault();
      closeWaiverWindow();
    }
  });

  const context = signatureCanvas.getContext("2d");
  let isDrawing = false;
  let hasSignature = false;

  function resizeSignatureCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = signatureCanvas.getBoundingClientRect();
    const width = Math.max(Math.round(rect.width), 320);
    const height = Math.max(Math.round(rect.height), 180);
    signatureCanvas.width = width * ratio;
    signatureCanvas.height = height * ratio;
    signatureCanvas.style.width = `${width}px`;
    signatureCanvas.style.height = `${height}px`;
    if (context) {
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 2.4;
      context.strokeStyle = "#fff2dc";
    }
    hasSignature = false;
  }

  resizeSignatureCanvas();
  window.addEventListener("resize", resizeSignatureCanvas);

  function getCanvasPoint(event) {
    const rect = signatureCanvas.getBoundingClientRect();
    const source = event.touches?.[0] || event;
    return {
      x: source.clientX - rect.left,
      y: source.clientY - rect.top,
    };
  }

  function beginStroke(event) {
    event.preventDefault();
    if (!context) {
      return;
    }

    const point = getCanvasPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    isDrawing = true;
  }

  function moveStroke(event) {
    if (!isDrawing || !context) {
      return;
    }

    event.preventDefault();
    const point = getCanvasPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    hasSignature = true;
    if (signatureFeedbackNode) {
      signatureFeedbackNode.textContent = "Signature captured.";
      signatureFeedbackNode.classList.add("success");
      signatureFeedbackNode.classList.remove("error");
    }
  }

  function endStroke() {
    isDrawing = false;
  }

  signatureCanvas.addEventListener("mousedown", beginStroke);
  signatureCanvas.addEventListener("mousemove", moveStroke);
  signatureCanvas.addEventListener("mouseup", endStroke);
  signatureCanvas.addEventListener("mouseleave", endStroke);
  signatureCanvas.addEventListener("touchstart", beginStroke, { passive: false });
  signatureCanvas.addEventListener("touchmove", moveStroke, { passive: false });
  signatureCanvas.addEventListener("touchend", endStroke);

  if (signatureClearButton instanceof HTMLButtonElement) {
    signatureClearButton.addEventListener("click", () => {
      if (context) {
        context.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
      }
      hasSignature = false;
      if (signatureFeedbackNode) {
        signatureFeedbackNode.textContent = "Signature cleared.";
        signatureFeedbackNode.classList.remove("success");
        signatureFeedbackNode.classList.add("error");
      }
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    if (!hasSignature) {
      if (signatureFeedbackNode) {
        signatureFeedbackNode.textContent = "A digital signature is required.";
        signatureFeedbackNode.classList.remove("success");
        signatureFeedbackNode.classList.add("error");
      }
      return;
    }

    const values = serializeForm();
    const registrationSnapshot = getRegistrationContext();
    const requiredRegistrationFields = [
      ["fullName", "full name"],
      ["email", "email"],
      ["phone", "phone number"],
      ["icPassportNo", "NRIC / Passport number"],
      ["dateOfBirth", "date of birth"],
      ["gender", "sex"],
      ["homeAddress", "home address"],
      ["emergencyContactName", "emergency contact name"],
      ["emergencyContactRelationship", "emergency contact relationship"],
      ["emergencyContactPhone", "emergency contact phone"],
    ];
    const missingRegistrationField = requiredRegistrationFields.find(([key]) => !cleanText(registrationSnapshot[key]));
    if (missingRegistrationField) {
      if (feedbackNode) {
        feedbackNode.textContent = `Return to registration to complete your ${missingRegistrationField[1]} before submitting the waiver.`;
        feedbackNode.classList.remove("success");
        feedbackNode.classList.add("error");
      }
      return;
    }

    const policyAcknowledgementInitials = cleanText(values.policyAcknowledgementInitials).toUpperCase();
    const payload = {
      fullName: registrationSnapshot.fullName,
      email: registrationSnapshot.email,
      phone: registrationSnapshot.phone,
      icPassportNo: registrationSnapshot.icPassportNo,
      dateOfBirth: registrationSnapshot.dateOfBirth,
      age: registrationSnapshot.age,
      gender: registrationSnapshot.gender,
      homeAddress: registrationSnapshot.homeAddress,
      occupation: registrationSnapshot.occupation,
      activityStyle: registrationSnapshot.activityStyle,
      emergencyContactName: registrationSnapshot.emergencyContactName,
      emergencyContactRelationship: registrationSnapshot.emergencyContactRelationship,
      emergencyContactPhone: registrationSnapshot.emergencyContactPhone,
      parqAnswers: {
        q1: cleanText(values.parq_q1),
        q2: cleanText(values.parq_q2),
        q3: cleanText(values.parq_q3),
        q4: cleanText(values.parq_q4),
        q5: cleanText(values.parq_q5),
        q6: cleanText(values.parq_q6),
        q7: cleanText(values.parq_q7),
      },
      parqExplanation: cleanText(values.parqExplanation),
      conditions: Array.isArray(values.conditions) ? values.conditions : values.conditions ? [values.conditions] : [],
      hasCurrentPain: values.hasCurrentPain === "yes",
      injuryLocation: cleanText(values.injuryLocation),
      injuryTriggers: cleanText(values.injuryTriggers),
      surgeriesRecent: values.surgeriesRecent === "yes",
      surgeriesDetails: cleanText(values.surgeriesDetails),
      currentMedications: cleanText(values.currentMedications),
      supplements: cleanText(values.supplements),
      allergies: cleanText(values.allergies),
      pregnancyStatus: cleanText(values.pregnancyStatus),
      pregnancyRestrictions: cleanText(values.pregnancyRestrictions),
      pdpaConsent: values.pdpaConsent === "yes",
      mediaConsent: cleanText(values.mediaConsent),
      policyAcknowledgementInitials,
      policyInitials: {
        cancellation: policyAcknowledgementInitials,
        lateArrival: policyAcknowledgementInitials,
        noShow: policyAcknowledgementInitials,
        packageValidity: policyAcknowledgementInitials,
        refundPolicy: policyAcknowledgementInitials,
        facilityRules: policyAcknowledgementInitials,
      },
      finalDeclarationName: cleanText(values.finalDeclarationName),
      witnessName: cleanText(values.witnessName),
      witnessSignatureName: cleanText(values.witnessSignatureName),
      signatureDataUrl: signatureCanvas.toDataURL("image/png"),
    };

    if (feedbackNode) {
      feedbackNode.textContent = "Saving your waiver...";
      feedbackNode.classList.remove("error");
      feedbackNode.classList.add("success");
    }

    try {
      const response = await window.fetch("/.netlify/functions/submit-client-waiver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || "Unable to save the waiver right now.");
      }

      const nextDraft = draft && typeof draft === "object" ? draft : { role: "client", values: {} };
      nextDraft.role = "client";
      nextDraft.values = {
        ...(nextDraft.values || {}),
        clientFullName: payload.fullName,
        clientEmailAddress: payload.email,
        clientPhone: payload.phone,
        clientBirthday: payload.dateOfBirth,
        clientGender: payload.gender === "prefer_not_to_say" ? "" : payload.gender,
        clientIcPassportNo: payload.icPassportNo,
        clientOccupation: payload.occupation,
        clientHomeAddress: payload.homeAddress,
        clientEmergencyName: payload.emergencyContactName,
        clientEmergencyRelationship: payload.emergencyContactRelationship,
        clientEmergencyPhone: payload.emergencyContactPhone,
        clientActivityStyle: payload.activityStyle,
      };

      writeSessionJson(DRAFT_KEY, nextDraft);
      writeSessionJson(WAIVER_STATE_KEY, {
        waiverSubmissionId: result.waiverSubmissionId,
        email: payload.email,
        signedAt: result.signedAt,
        preferredCoachId: registrationSnapshot.preferredCoachId || nextDraft.values.clientPreferredCoachId || "",
      });

      window.location.href = "./account.html?role=client&waiver=complete";
    } catch (error) {
      if (feedbackNode) {
        feedbackNode.textContent = error?.message || "Unable to save the waiver right now.";
        feedbackNode.classList.remove("success");
        feedbackNode.classList.add("error");
      }
    }
  });
})();
