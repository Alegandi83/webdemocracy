export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  OPEN_TEXT = 'open_text',
  SCALE = 'scale',
  RATING = 'rating',
  DATE = 'date'
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface SurveyOption {
  id: number;
  survey_id: number;
  option_text: string;
  option_order?: number;
  created_at: string;
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
  expires_at?: string;
  is_active: boolean;
  allow_multiple_responses?: boolean;
  allow_custom_options?: boolean;
  require_comment?: boolean;
  rating_icon?: 'star' | 'heart' | 'number';
  options: SurveyOption[];
  tags: Tag[];
  total_votes?: number;
  total_responses?: number;
  average_like_rating?: number;
}

export interface SurveyCreate {
  title: string;
  description?: string;
  question_type: QuestionType;
  options: string[];
  tag_ids?: number[];
  expires_at?: string;
  min_value?: number;
  max_value?: number;
  scale_min_label?: string;
  scale_max_label?: string;
  allow_multiple_responses?: boolean;
  allow_custom_options?: boolean;
  require_comment?: boolean;
  rating_icon?: 'star' | 'heart' | 'number';
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
  open_responses: OpenResponse[];
  most_common_date?: string;
}

export interface SurveyStats {
  survey_id: number;
  survey_title: string;
  survey_description?: string;
  question_type: QuestionType;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
  total_participants: number;
  total_votes: number;
  last_vote_at?: string;
  options_count: number;
  like_stats?: SurveyLikeStats;
  tags: Tag[];
}

export interface TagCreate {
  name: string;
  color?: string;
}
