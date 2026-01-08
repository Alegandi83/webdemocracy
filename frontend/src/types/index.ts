export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  OPEN_TEXT = 'open_text',
  SCALE = 'scale',
  RATING = 'rating',
  DATE = 'date'
}

export enum ClosureType {
  PERMANENT = 'permanent',     // Sondaggio permanente
  SCHEDULED = 'scheduled',     // Scadenza fissata
  MANUAL = 'manual'            // Chiusura libera
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface SurveyOption {
  id: number;
  survey_id: number;
  option_text: string;
  option_order?: number;
  created_at: string;
}

export interface UserBasic {
  id: number;
  name: string;
  email: string;
}

export interface Survey {
  id: number;
  title: string;
  description?: string;
  question_type: QuestionType;
  min_value?: number;
  max_value?: number;
  scale_min_label?: string;
  scale_max_label?: string;
  created_at: string;
  closure_type: ClosureType;
  expires_at?: string;
  is_active: boolean;
  show_results_on_close?: boolean;
  allow_multiple_responses?: boolean;
  allow_custom_options?: boolean;
  require_comment?: boolean;
  rating_icon?: 'star' | 'heart' | 'number';
  is_anonymous?: boolean;
  resource_type?: 'none' | 'url' | 'news' | 'image';
  resource_url?: string;
  resource_news_id?: number;
  user_id: number;
  creator?: UserBasic;
  options: SurveyOption[];
  tags: Tag[];
  total_votes?: number;
  total_responses?: number;
  unique_participants?: number;
  participant_user_ids?: number[];
  average_like_rating?: number;
  user_like_rating?: number;  // Gradimento personale dell'utente (1-5)
  has_user_voted?: boolean;
}

export interface SurveyCreate {
  title: string;
  description?: string;
  question_type: QuestionType;
  closure_type?: ClosureType;
  options: string[];
  tag_ids?: number[];
  expires_at?: string;
  show_results_on_close?: boolean;
  min_value?: number;
  max_value?: number;
  scale_min_label?: string;
  scale_max_label?: string;
  allow_multiple_responses?: boolean;
  allow_custom_options?: boolean;
  require_comment?: boolean;
  rating_icon?: 'star' | 'heart' | 'number';
  is_anonymous?: boolean;
  resource_type?: 'none' | 'url' | 'news' | 'image';
  resource_url?: string;
  resource_news_id?: number;
}

export interface OptionVote {
  option_id: number;
  numeric_value?: number;
}

export interface OptionResponse {
  option_id: number;
  response_text: string;
}

export interface VoteCreate {
  option_ids?: number[];
  custom_option_text?: string;
  numeric_value?: number;
  date_value?: string;
  // Per OPEN_TEXT senza opzioni (backward compatibility) - rappresenta il testo della risposta aperta
  comment?: string;
  // Nuovi campi per voti multipli per opzione
  option_votes?: OptionVote[];
  option_responses?: OptionResponse[];
  // Gradimento e commento sul sondaggio (opzionali, inviati insieme al voto)
  like_rating?: number;  // 1-5 pallini verdi
  survey_comment?: string;  // Commento generale sul sondaggio
}

export interface NumericStats {
  average: number;
  min_value: number;
  max_value: number;
  median: number;
  count: number;
}

export interface ValueDistribution {
  value: number;
  count: number;
}

export interface OpenResponse {
  id: number;
  survey_id: number;
  option_id?: number;
  response_text: string;
  responded_at: string;
  voter_ip?: string;
  user_id?: number;
}

export interface SurveyResult {
  option_id?: number;
  option_text?: string;
  vote_count: number;
  percentage?: number;
  // Per risultati numerici per opzione (RATING/SCALE con opzioni)
  numeric_average?: number;
  numeric_median?: number;
  numeric_min?: number;
  numeric_max?: number;
  // Distribuzione dei voti per ogni valore di rating (per bubble chart)
  value_distribution?: ValueDistribution[];
}

export interface SurveyLike {
  id: number;
  survey_id: number;
  user_ip?: string;
  user_session?: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface SurveyLikeCreate {
  rating: number;
  comment?: string;
}

export interface SurveyLikeStats {
  average_rating: number;
  total_likes: number;
  rating_distribution: ValueDistribution[];
}

export interface SurveyLikeComment {
  id: number;
  survey_id: number;
  rating: number;
  comment: string;
  created_at: string;
  user_id?: number;
  user_name?: string;
  user_email?: string;
}

export interface SurveyResultsResponse {
  survey_id: number;
  survey_title: string;
  question_type: QuestionType;
  total_votes: number;
  total_responses: number;
  results: SurveyResult[];
  numeric_stats?: NumericStats;
  value_distribution?: ValueDistribution[];
  rating_icon?: 'star' | 'heart' | 'number';
  min_value?: number;
  max_value?: number;
  like_stats?: SurveyLikeStats;
  like_comments: SurveyLikeComment[];
  open_responses: OpenResponse[];
  most_common_date?: string;
  user_voted_option_ids: number[]; // Lista degli ID delle opzioni votate dall'utente corrente (per sondaggi non anonimi)
  user_response_ids: number[]; // Lista degli ID delle risposte aperte dell'utente corrente (per sondaggi non anonimi)
  user_numeric_votes?: { [key: string]: number }; // Dict {option_id: numeric_value} per sondaggi SCALE/RATING non anonimi (le chiavi JSON sono sempre stringhe)
}

export interface SurveyStats {
  survey_id: number;
  survey_title: string;
  survey_description?: string;
  question_type: QuestionType;
  closure_type?: ClosureType;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
  show_results_on_close?: boolean;
  total_participants: number;
  total_votes: number;
  last_vote_at?: string;
  options_count: number;
  like_stats?: SurveyLikeStats;
  user_like_rating?: number;  // Gradimento personale dell'utente (1-5)
  tags: Tag[];
  has_user_voted: boolean;
}

export interface TagCreate {
  name: string;
  color?: string;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  POLLSTER = 'pollster',
  EDITOR = 'editor'
}

export interface User {
  id: number;
  name: string;
  email: string;
  date_of_birth?: string;
  profile_photo?: string;
  user_role: UserRole;
  gender?: string;
  address_region?: string;
  preferred_language: string;
  registration_date: string;
  actual_geolocation?: string;
  last_login_date?: string;
  last_ip_address?: string;
  created_at: string;
  updated_at: string;
}

export interface UserUpdate {
  name?: string;
  date_of_birth?: string;
  profile_photo?: string;
  gender?: string;
  address_region?: string;
  preferred_language?: string;
  actual_geolocation?: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
}

export interface GroupCreate {
  name: string;
  description?: string;
}

export interface GroupUpdate {
  name?: string;
  description?: string;
}
