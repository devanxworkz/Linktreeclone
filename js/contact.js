/**
 * ChatIQ — Contact Form Handler
 *
 * Handles form submission, validation, Supabase insert,
 * loading/success/error states, and WhatsApp support button.
 * Logs debugging information to the browser console.
 */
(function () {
  var FORM_ID = 'contactForm';
  var STATUS_ID = 'contactFormStatus';
  var SUBMIT_BTN_ID = 'contactSubmitBtn';
  var BTN_TEXT_ID = 'contactBtnText';
  var BTN_LOADER_ID = 'contactBtnLoader';

  function getEl(id) { return document.getElementById(id); }

  function showStatus(message, type) {
    var el = getEl(STATUS_ID);
    if (!el) return;
    el.textContent = message;
    el.style.display = 'block';
    el.style.padding = '12px 16px';
    el.style.borderRadius = '8px';
    el.style.marginBottom = '16px';
    el.style.fontSize = '14px';
    el.style.fontWeight = '500';
    el.style.lineHeight = '1.5';

    if (type === 'success') {
      el.style.background = '#DCFCE7';
      el.style.color = '#166534';
      el.style.border = '1px solid #BBF7D0';
    } else if (type === 'error') {
      el.style.background = '#FEE2E2';
      el.style.color = '#991B1B';
      el.style.border = '1px solid #FECACA';
    }
  }

  function hideStatus() {
    var el = getEl(STATUS_ID);
    if (el) el.style.display = 'none';
  }

  function setLoading(isLoading) {
    var btn = getEl(SUBMIT_BTN_ID);
    var text = getEl(BTN_TEXT_ID);
    var loader = getEl(BTN_LOADER_ID);
    if (!btn) return;
    btn.disabled = isLoading;
    if (text) text.style.display = isLoading ? 'none' : 'inline';
    if (loader) loader.style.display = isLoading ? 'inline' : 'none';
  }

  function clearForm() {
    var form = getEl(FORM_ID);
    if (form) form.reset();
  }

  function handleSubmit(e) {
    e.preventDefault();
    hideStatus();

    var name = (getEl('name') || {}).value || '';
    var email = (getEl('email') || {}).value || '';
    var subject = (getEl('subject') || {}).value || '';
    var message = (getEl('message') || {}).value || '';

    // Validate required fields
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      showStatus('Please fill in all required fields.', 'error');
      return;
    }

    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    var client = window.__CHATIQ_SUPABASE__;

    if (!client) {
      showStatus(
        'Unable to send your message right now. Please try again later.',
        'error'
      );
      console.error('[ChatIQ Contact] Supabase client is null. Check that credentials are configured in __CHATIQ_CONFIG__.');
      return;
    }

    console.log('[ChatIQ Contact] Form submission started.', {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim()
    });

    setLoading(true);

    client
      .from('contact_messages')
      .insert([
        {
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim()
        }
      ])
      .then(function (response) {
        setLoading(false);

        if (response.error) {
          console.error('[ChatIQ Contact] Supabase insert failed:', response.error);
          showStatus(
            'Something went wrong. Please try again later.',
            'error'
          );
        } else {
          console.log('[ChatIQ Contact] Supabase insert succeeded.', response);
          showStatus(
            'Your message has been sent successfully. We will contact you soon.',
            'success'
          );
          clearForm();
        }
      })
      .catch(function (err) {
        setLoading(false);
        console.error('[ChatIQ Contact] Supabase request exception:', err);
        showStatus(
          'Something went wrong. Please try again later.',
          'error'
        );
      });
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', function () {
    var form = getEl(FORM_ID);
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
  });
})();
