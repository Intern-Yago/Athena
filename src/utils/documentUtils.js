/**
 * Brazilian Document Formatting & Verification Utilities
 * 
 * Supports:
 * - Real-time dynamic masking between CPF (000.000.000-00) and CNPJ (00.000.000/0000-00)
 * - Official Brazilian Alphanumeric CNPJ Reform (IN RFB nº 2.229/2024), where CNPJs include letters and digits
 * - Automatic company data lookup via open.cnpja.com
 */

export function formatCpfCnpj(value) {
  if (!value) {
    return {
      formatted: "",
      raw: "",
      isCnpj: false,
      isComplete: false,
      type: "CPF"
    };
  }

  // Preserve both numbers and uppercase letters for modern Brazilian CNPJ
  const raw = String(value).replace(/[^0-9a-zA-Z]/g, "").toUpperCase();

  if (raw.length <= 11) {
    let f = raw;
    if (f.length > 9) {
      f = f.replace(/^([0-9A-Z]{3})([0-9A-Z]{3})([0-9A-Z]{3})([0-9A-Z]{1,2})$/, "$1.$2.$3-$4");
    } else if (f.length > 6) {
      f = f.replace(/^([0-9A-Z]{3})([0-9A-Z]{3})([0-9A-Z]{1,3})$/, "$1.$2.$3");
    } else if (f.length > 3) {
      f = f.replace(/^([0-9A-Z]{3})([0-9A-Z]{1,3})$/, "$1.$2");
    }

    return {
      formatted: f,
      raw,
      isCnpj: false,
      isComplete: raw.length === 11,
      type: "CPF"
    };
  } else {
    // Length > 11: Switch dynamically to CNPJ format (maximum 14 chars)
    const limited = raw.slice(0, 14);
    let f = limited;

    if (f.length > 12) {
      f = f.replace(/^([0-9A-Z]{2})([0-9A-Z]{3})([0-9A-Z]{3})([0-9A-Z]{4})([0-9A-Z]{1,2})$/, "$1.$2.$3/$4-$5");
    } else if (f.length > 8) {
      f = f.replace(/^([0-9A-Z]{2})([0-9A-Z]{3})([0-9A-Z]{3})([0-9A-Z]{1,4})$/, "$1.$2.$3/$4");
    } else if (f.length > 5) {
      f = f.replace(/^([0-9A-Z]{2})([0-9A-Z]{3})([0-9A-Z]{1,3})$/, "$1.$2.$3");
    } else if (f.length > 2) {
      f = f.replace(/^([0-9A-Z]{2})([0-9A-Z]{1,3})$/, "$1.$2");
    }

    return {
      formatted: f,
      raw: limited,
      isCnpj: true,
      isComplete: limited.length === 14,
      type: "CNPJ"
    };
  }
}

/**
 * Fetch company information from open.cnpja.com
 * @param {string} taxId - CNPJ (formatted or unformatted)
 * @returns {Promise<Object>}
 */
export async function fetchCnpjData(taxId) {
  const clean = String(taxId || "").replace(/[^0-9a-zA-Z]/g, "").toUpperCase();

  if (clean.length !== 14) {
    throw new Error("CNPJ incompleto. Informe os 14 caracteres do CNPJ.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(`https://open.cnpja.com/office/${clean}`, {
      signal: controller.signal,
      headers: {
        "Accept": "application/json"
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("CNPJ não localizado na base da Receita Federal.");
      }
      if (res.status === 429) {
        throw new Error("Limite de consultas atingido. Tente novamente em alguns segundos.");
      }
      throw new Error(`Erro ao consultar CNPJ (Status ${res.status})`);
    }

    const data = await res.json();

    const companyName = data.company?.name || "";
    const tradeName = data.alias || data.company?.name || "";
    const zip = data.address?.zip ? String(data.address.zip).replace(/\D/g, "") : "";
    const street = data.address?.street || "";
    const number = data.address?.number || "";
    const district = data.address?.district || "";
    const city = data.address?.city || "";
    const state = data.address?.state || "";
    const phone = data.phones?.[0] ? `(${data.phones[0].area}) ${data.phones[0].number}` : "";
    const email = data.emails?.[0]?.address || "";
    const status = data.status?.text || "Ativa";

    return {
      companyName,
      tradeName,
      zip,
      street,
      number,
      district,
      city,
      state,
      phone,
      email,
      status,
      raw: data
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Tempo limite de consulta ao CNPJ esgotado.");
    }
    throw err;
  }
}
