import { getBasicAuthHeader } from './auth';

interface MayaEsimResponse {
  result: number;
  status: number;
  message: string;
  request_id: string;
  developer_message: string;
  esim: {
    apn: string;
    tag: string;
    uid: string;
    iccid: string;
    state: string;
    auto_apn: string;
    manual_code: string;
    smdp_address: string;
    date_assigned: string;
    network_status: string;
    service_status: string;
    activation_code: string;
  };
}

interface CreateEsimRequest {
  tag: string;
  region: string;
}

/**
 * Maya API client for eSIM operations
 */
export function useMayaApi() {
  const config = useRuntimeConfig();

  const endpoint = config.mayaApiEndpoint;
  const clientId = config.mayaApiClientId;
  const clientSecret = config.mayaApiClientSecret;

  if (!endpoint || !clientId || !clientSecret) {
    throw new Error('Maya API configuration is missing');
  }

  const authHeader = `Basic ${getBasicAuthHeader(clientId, clientSecret)}`;

  /**
   * Create a new eSIM
   */
  async function createEsim(data: CreateEsimRequest): Promise<MayaEsimResponse['esim']> {
    const response = await $fetch<MayaEsimResponse>(`${endpoint}/esim`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: data,
    });

    if (response.result !== 1) {
      throw new Error(`Maya API error: ${response.message}`);
    }

    return response.esim;
  }

  /**
   * Get eSIM details by ICCID
   */
  async function getEsimDetails(iccid: string) {
    const response = await $fetch<MayaEsimResponse>(`${endpoint}/esim/${iccid}`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    });

    return response.esim;
  }

  return {
    createEsim,
    getEsimDetails,
  };
}
