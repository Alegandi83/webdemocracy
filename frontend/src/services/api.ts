import axios from 'axios';
import { Survey, SurveyCreate, VoteCreate, SurveyResultsResponse, SurveyStats, Tag, TagCreate, SurveyLike, SurveyLikeCreate, SurveyLikeStats } from '../types';

// For local/hybrid development: use localhost:8000
// For Databricks deployment: the build process will handle this
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000' 
    : '',  // In production, same origin
});

export const surveyApi = {
  // Ottenere tutti i sondaggi
  getAllSurveys: async (params?: {
    my_surveys?: boolean;
    voted_status?: 'voted' | 'not_voted';
    include_expired?: boolean;
  }): Promise<Survey[]> => {
    const response = await api.get('/surveys', {
      params: { 
        include_expired: true,
        ...params 
      }
    });
    return response.data;
  },

  // Ottenere un singolo sondaggio
  getSurvey: async (id: number): Promise<Survey> => {
    const response = await api.get(`/surveys/${id}`);
    return response.data;
  },

  // Creare un nuovo sondaggio
  createSurvey: async (survey: SurveyCreate): Promise<Survey> => {
    const response = await api.post('/surveys', survey);
    return response.data;
  },

  // Votare in un sondaggio
  voteSurvey: async (surveyId: number, vote: VoteCreate): Promise<void> => {
    await api.post(`/surveys/${surveyId}/vote`, vote);
  },

  // Ottenere i risultati di un sondaggio
  getSurveyResults: async (surveyId: number): Promise<SurveyResultsResponse> => {
    const response = await api.get(`/surveys/${surveyId}/results`);
    return response.data;
  },

  // Eliminare un sondaggio
  deleteSurvey: async (surveyId: number): Promise<void> => {
    await api.delete(`/surveys/${surveyId}`);
  },

  // Eliminare tutti i sondaggi
  deleteAllSurveys: async (): Promise<{ message: string; deleted_count: number }> => {
    const response = await api.delete('/surveys');
    return response.data;
  },

  // Ottenere statistiche dettagliate di un sondaggio
  getSurveyStats: async (surveyId: number): Promise<SurveyStats> => {
    const response = await api.get(`/surveys/${surveyId}/stats`);
    return response.data;
  },

  // Ottenere tutti i tag
  getTags: async (): Promise<Tag[]> => {
    const response = await api.get('/tags');
    return response.data;
  },

  // Creare un nuovo tag
  createTag: async (tag: TagCreate): Promise<Tag> => {
    const response = await api.post('/tags', tag);
    return response.data;
  },

  // Valutare il gradimento di un sondaggio
  likeSurvey: async (surveyId: number, like: SurveyLikeCreate): Promise<void> => {
    await api.post(`/surveys/${surveyId}/like`, like);
  },

  // Ottenere il gradimento dell'utente per un sondaggio
  getUserLike: async (surveyId: number): Promise<SurveyLike | null> => {
    try {
      const response = await api.get(`/surveys/${surveyId}/like`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Ottenere le statistiche dei gradimenti
  getLikeStats: async (surveyId: number): Promise<SurveyLikeStats | null> => {
    try {
      const response = await api.get(`/surveys/${surveyId}/like/stats`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Ottenere un setting
  getSetting: async (key: string): Promise<{ key: string; value: string }> => {
    const response = await api.get(`/settings/${key}`);
    return response.data;
  },

  // Aggiornare un setting
  updateSetting: async (key: string, value: string): Promise<{ key: string; value: string }> => {
    const response = await api.put(`/settings/${key}`, { key, value });
    return response.data;
  },

  // Resettare un setting al valore di default
  resetSetting: async (key: string): Promise<{ key: string; value: string; message: string }> => {
    const response = await api.delete(`/settings/${key}`);
    return response.data;
  },
};
