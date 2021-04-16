export interface History {
  noofslots:           number;
  day_size:            string;
  week_size:           string;
  month_size:          string;
  total_size:          string;
  last_history_update: number;
  slots:               Slot[];
}

export interface Slot {
  action_line:   string;
  series:        string;
  show_details:  string;
  script_log:    string;
  meta:          null;
  fail_message:  string;
  loaded:        boolean;
  id:            number;
  size:          string;
  category:      string;
  pp:            string;
  retry:         number;
  completeness:  number;
  script:        string;
  nzb_name:      string;
  download_time: number;
  storage:       string;
  has_rating:    boolean;
  status:        string;
  script_line:   string;
  completed:     number;
  nzo_id:        string;
  downloaded:    number;
  report:        string;
  password:      string;
  path:          string;
  postproc_time: number;
  name:          string;
  url:           string;
  md5sum:        string;
  bytes:         number;
  url_info:      string;
  stage_log:     StageLog[];
}

export interface StageLog {
  name:    string;
  actions: string[];
}
