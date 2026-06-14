'use client';

import { useState, type FormEvent } from 'react';
import { COMPANY } from '@/lib/constants/company';

const PARTNER_EMAIL_SUBJECT = 'Partnerskap';

export function PartnerContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const body = [
      `Navn: ${name}`,
      `E-post: ${email}`,
      `Selskap / merke: ${company}`,
      '',
      message,
    ].join('\n');

    const mailto = `mailto:${COMPANY.email}?subject=${encodeURIComponent(PARTNER_EMAIL_SUBJECT)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <form className="partner-page__form" onSubmit={handleSubmit}>
      <div className="partner-page__form-row">
        <label className="partner-page__field">
          <span className="sr-only">Ditt navn</span>
          <input
            type="text"
            name="name"
            required
            placeholder="Ditt navn"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="partner-page__input"
            autoComplete="name"
          />
        </label>
        <label className="partner-page__field">
          <span className="sr-only">Din e-post</span>
          <input
            type="email"
            name="email"
            required
            placeholder="Din e-post"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="partner-page__input"
            autoComplete="email"
          />
        </label>
      </div>

      <label className="partner-page__field">
        <span className="sr-only">Selskap / merkenavn</span>
        <input
          type="text"
          name="company"
          required
          placeholder="Selskap / merkenavn"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          className="partner-page__input"
          autoComplete="organization"
        />
      </label>

      <label className="partner-page__field">
        <span className="sr-only">Melding</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Fortell oss om merket ditt og hva du ser etter …"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="partner-page__textarea"
        />
      </label>

      <button type="submit" className="partner-page__cta partner-page__cta--wide">
        Send melding
      </button>
    </form>
  );
}
