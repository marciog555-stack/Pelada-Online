// Gerado via `supabase gen types typescript` (mcp__Supabase__generate_typescript_types).
// Nao editar a mao - rode de novo a geracao depois de aplicar migrations.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      competitions: {
        Row: {
          connection_drop_rule: string | null
          created_at: string
          created_by: string
          id: string
          league_id: string
          name: string
          preset_id: string
        }
        Insert: {
          connection_drop_rule?: string | null
          created_at?: string
          created_by: string
          id?: string
          league_id: string
          name: string
          preset_id: string
        }
        Update: {
          connection_drop_rule?: string | null
          created_at?: string
          created_by?: string
          id?: string
          league_id?: string
          name?: string
          preset_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitions_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      crest_change_requests: {
        Row: {
          admin_note: string | null
          created_at: string
          edition_participant_id: string
          id: string
          requested_crest_url: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          edition_participant_id: string
          id?: string
          requested_crest_url: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          edition_participant_id?: string
          id?: string
          requested_crest_url?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "crest_change_requests_edition_participant_id_fkey"
            columns: ["edition_participant_id"]
            isOneToOne: false
            referencedRelation: "edition_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crest_change_requests_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      edition_awards: {
        Row: {
          athlete_name: string | null
          award_type: string
          created_at: string
          edition_id: string
          id: string
          participant_id: string
          value: number | null
        }
        Insert: {
          athlete_name?: string | null
          award_type: string
          created_at?: string
          edition_id: string
          id?: string
          participant_id: string
          value?: number | null
        }
        Update: {
          athlete_name?: string | null
          award_type?: string
          created_at?: string
          edition_id?: string
          id?: string
          participant_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "edition_awards_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edition_awards_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "edition_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      edition_participants: {
        Row: {
          created_at: string
          crest_url: string | null
          edition_id: string
          final_position: number | null
          id: string
          primary_color: string
          team_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          crest_url?: string | null
          edition_id: string
          final_position?: number | null
          id?: string
          primary_color?: string
          team_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          crest_url?: string | null
          edition_id?: string
          final_position?: number | null
          id?: string
          primary_color?: string
          team_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edition_participants_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edition_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      editions: {
        Row: {
          competition_id: string
          completed_at: string | null
          created_at: string
          id: string
          number: number
          round_deadline_days: number
          started_at: string | null
          status: string
          wo_away_goals: number
          wo_home_goals: number
        }
        Insert: {
          competition_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          number: number
          round_deadline_days?: number
          started_at?: string | null
          status?: string
          wo_away_goals?: number
          wo_home_goals?: number
        }
        Update: {
          competition_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          number?: number
          round_deadline_days?: number
          started_at?: string | null
          status?: string
          wo_away_goals?: number
          wo_home_goals?: number
        }
        Relationships: [
          {
            foreignKeyName: "editions_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      efootball_id_claims: {
        Row: {
          admin_note: string | null
          claimant_id: string
          created_at: string
          efootball_id: string
          id: string
          proof_image_path: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          target_profile_id: string
        }
        Insert: {
          admin_note?: string | null
          claimant_id: string
          created_at?: string
          efootball_id: string
          id?: string
          proof_image_path: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_profile_id: string
        }
        Update: {
          admin_note?: string | null
          claimant_id?: string
          created_at?: string
          efootball_id?: string
          id?: string
          proof_image_path?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "efootball_id_claims_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      league_members: {
        Row: {
          id: string
          joined_at: string
          league_id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          league_id: string
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          league_id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_members_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          created_at: string
          description: string | null
          id: string
          invite_code: string
          name: string
          owner_id: string
          require_approval: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          invite_code?: string
          name: string
          owner_id: string
          require_approval?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          invite_code?: string
          name?: string
          owner_id?: string
          require_approval?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leagues_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_events: {
        Row: {
          assist_athlete_name: string | null
          athlete_name: string
          created_at: string
          event_type: string
          id: string
          match_id: string
          participant_id: string
        }
        Insert: {
          assist_athlete_name?: string | null
          athlete_name: string
          created_at?: string
          event_type: string
          id?: string
          match_id: string
          participant_id: string
        }
        Update: {
          assist_athlete_name?: string | null
          athlete_name?: string
          created_at?: string
          event_type?: string
          id?: string
          match_id?: string
          participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "edition_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      match_reports: {
        Row: {
          away_goals: number
          away_red_cards: number
          away_yellow_cards: number
          created_at: string
          home_goals: number
          home_red_cards: number
          home_yellow_cards: number
          id: string
          kind: string
          match_id: string
          message: string | null
          reported_by: string
          screenshot_path: string
        }
        Insert: {
          away_goals: number
          away_red_cards?: number
          away_yellow_cards?: number
          created_at?: string
          home_goals: number
          home_red_cards?: number
          home_yellow_cards?: number
          id?: string
          kind?: string
          match_id: string
          message?: string | null
          reported_by: string
          screenshot_path: string
        }
        Update: {
          away_goals?: number
          away_red_cards?: number
          away_yellow_cards?: number
          created_at?: string
          home_goals?: number
          home_red_cards?: number
          home_yellow_cards?: number
          id?: string
          kind?: string
          match_id?: string
          message?: string | null
          reported_by?: string
          screenshot_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_reports_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_goals: number | null
          away_participant_id: string | null
          confirmed_at: string | null
          created_at: string
          deadline_at: string | null
          edition_id: string
          home_goals: number | null
          home_participant_id: string | null
          id: string
          leg: number
          reported_at: string | null
          reported_by: string | null
          resolved_at: string | null
          resolved_by: string | null
          round: number
          status: string
          wo_winner_participant_id: string | null
        }
        Insert: {
          away_goals?: number | null
          away_participant_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          deadline_at?: string | null
          edition_id: string
          home_goals?: number | null
          home_participant_id?: string | null
          id?: string
          leg?: number
          reported_at?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          round: number
          status?: string
          wo_winner_participant_id?: string | null
        }
        Update: {
          away_goals?: number | null
          away_participant_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          deadline_at?: string | null
          edition_id?: string
          home_goals?: number | null
          home_participant_id?: string | null
          id?: string
          leg?: number
          reported_at?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          round?: number
          status?: string
          wo_winner_participant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_participant_id_fkey"
            columns: ["away_participant_id"]
            isOneToOne: false
            referencedRelation: "edition_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_participant_id_fkey"
            columns: ["home_participant_id"]
            isOneToOne: false
            referencedRelation: "edition_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_wo_winner_participant_id_fkey"
            columns: ["wo_winner_participant_id"]
            isOneToOne: false
            referencedRelation: "edition_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      mundial_matches: {
        Row: {
          away_goals: number | null
          away_slot_id: string | null
          created_at: string
          home_goals: number | null
          home_slot_id: string | null
          id: string
          mundial_id: string
          resolved_at: string | null
          resolved_by: string | null
          round: number
          status: string
          wo_winner_slot_id: string | null
        }
        Insert: {
          away_goals?: number | null
          away_slot_id?: string | null
          created_at?: string
          home_goals?: number | null
          home_slot_id?: string | null
          id?: string
          mundial_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          round: number
          status?: string
          wo_winner_slot_id?: string | null
        }
        Update: {
          away_goals?: number | null
          away_slot_id?: string | null
          created_at?: string
          home_goals?: number | null
          home_slot_id?: string | null
          id?: string
          mundial_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          round?: number
          status?: string
          wo_winner_slot_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mundial_matches_away_slot_id_fkey"
            columns: ["away_slot_id"]
            isOneToOne: false
            referencedRelation: "mundial_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mundial_matches_home_slot_id_fkey"
            columns: ["home_slot_id"]
            isOneToOne: false
            referencedRelation: "mundial_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mundial_matches_mundial_id_fkey"
            columns: ["mundial_id"]
            isOneToOne: false
            referencedRelation: "mundials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mundial_matches_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mundial_matches_wo_winner_slot_id_fkey"
            columns: ["wo_winner_slot_id"]
            isOneToOne: false
            referencedRelation: "mundial_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      mundial_slots: {
        Row: {
          confirmed: boolean
          created_at: string
          crest_url: string | null
          edition_id: string
          id: string
          league_id: string
          mundial_id: string
          seed: number | null
          team_name: string
          user_id: string
        }
        Insert: {
          confirmed?: boolean
          created_at?: string
          crest_url?: string | null
          edition_id: string
          id?: string
          league_id: string
          mundial_id: string
          seed?: number | null
          team_name: string
          user_id: string
        }
        Update: {
          confirmed?: boolean
          created_at?: string
          crest_url?: string | null
          edition_id?: string
          id?: string
          league_id?: string
          mundial_id?: string
          seed?: number | null
          team_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mundial_slots_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mundial_slots_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mundial_slots_mundial_id_fkey"
            columns: ["mundial_id"]
            isOneToOne: false
            referencedRelation: "mundials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mundial_slots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mundials: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string
          id: string
          max_slots: number | null
          name: string
          season_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by: string
          id?: string
          max_slots?: number | null
          name: string
          season_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string
          id?: string
          max_slots?: number | null
          name?: string
          season_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mundials_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mundials_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_contacts: {
        Row: {
          created_at: string
          id: string
          phone: string
        }
        Insert: {
          created_at?: string
          id: string
          phone: string
        }
        Update: {
          created_at?: string
          id?: string
          phone?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          display_name: string
          efootball_id: string
          id: string
          nickname: string | null
          platform: string
          state: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          display_name: string
          efootball_id: string
          id: string
          nickname?: string | null
          platform: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          efootball_id?: string
          id?: string
          nickname?: string | null
          platform?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          created_at: string
          created_by: string
          ends_at: string
          id: string
          name: string
          starts_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          ends_at: string
          id?: string
          name: string
          starts_at: string
        }
        Update: {
          created_at?: string
          created_by?: string
          ends_at?: string
          id?: string
          name?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seasons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_confirm_match_report: {
        Args: { p_match_id: string }
        Returns: {
          away_goals: number | null
          away_participant_id: string | null
          confirmed_at: string | null
          created_at: string
          deadline_at: string | null
          edition_id: string
          home_goals: number | null
          home_participant_id: string | null
          id: string
          leg: number
          reported_at: string | null
          reported_by: string | null
          resolved_at: string | null
          resolved_by: string | null
          round: number
          status: string
          wo_winner_participant_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "matches"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      apply_match_wo: {
        Args: { p_match_id: string; p_winner_participant_id: string }
        Returns: {
          away_goals: number | null
          away_participant_id: string | null
          confirmed_at: string | null
          created_at: string
          deadline_at: string | null
          edition_id: string
          home_goals: number | null
          home_participant_id: string | null
          id: string
          leg: number
          reported_at: string | null
          reported_by: string | null
          resolved_at: string | null
          resolved_by: string | null
          round: number
          status: string
          wo_winner_participant_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "matches"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      auto_confirm_overdue_matches: { Args: never; Returns: undefined }
      close_edition: {
        Args: { p_awards: Json; p_edition_id: string; p_final_positions: Json }
        Returns: undefined
      }
      confirm_match_report: {
        Args: { p_match_id: string }
        Returns: {
          away_goals: number | null
          away_participant_id: string | null
          confirmed_at: string | null
          created_at: string
          deadline_at: string | null
          edition_id: string
          home_goals: number | null
          home_participant_id: string | null
          id: string
          leg: number
          reported_at: string | null
          reported_by: string | null
          resolved_at: string | null
          resolved_by: string | null
          round: number
          status: string
          wo_winner_participant_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "matches"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      edition_status: { Args: { p_edition_id: string }; Returns: string }
      get_league_preview_by_invite_code: {
        Args: { p_invite_code: string }
        Returns: {
          description: string
          id: string
          member_count: number
          name: string
          require_approval: boolean
        }[]
      }
      global_season_ranking: {
        Args: { p_season_id: string }
        Returns: {
          avatar_url: string
          display_name: string
          editions_played: number
          efootball_id: string
          points: number
          titles: number
          user_id: string
        }[]
      }
      is_efootball_id_available: {
        Args: { p_efootball_id: string }
        Returns: boolean
      }
      is_league_admin: { Args: { p_league_id: string }; Returns: boolean }
      is_league_member: { Args: { p_league_id: string }; Returns: boolean }
      is_match_player: { Args: { p_match_id: string }; Returns: boolean }
      is_phone_available: { Args: { p_phone: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      join_league_by_invite_code: {
        Args: { p_invite_code: string }
        Returns: {
          id: string
          joined_at: string
          league_id: string
          role: string
          status: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "league_members"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      league_id_for_competition: {
        Args: { p_competition_id: string }
        Returns: string
      }
      league_id_for_edition: { Args: { p_edition_id: string }; Returns: string }
      league_id_for_match: { Args: { p_match_id: string }; Returns: string }
      league_player_stats: {
        Args: { p_league_id: string }
        Returns: {
          avatar_url: string
          display_name: string
          draws: number
          goals_against: number
          goals_for: number
          losses: number
          played: number
          points: number
          user_id: string
          wins: number
        }[]
      }
      league_role: { Args: { p_league_id: string }; Returns: string }
      league_top_scorers: {
        Args: { p_league_id: string }
        Returns: {
          assists: number
          athlete_name: string
          avatar_url: string
          display_name: string
          goals: number
          user_id: string
        }[]
      }
      mundial_eligible_champions: {
        Args: { p_mundial_id: string }
        Returns: {
          completed_at: string
          crest_url: string
          display_name: string
          edition_id: string
          efootball_id: string
          league_id: string
          league_name: string
          slot_id: string
          team_name: string
          user_id: string
        }[]
      }
      player_achievements: {
        Args: { p_user_id: string }
        Returns: {
          achievement_count: number
          achievement_type: string
          last_at: string
        }[]
      }
      player_career_history: {
        Args: { p_user_id: string }
        Returns: {
          competition_id: string
          competition_name: string
          completed_at: string
          crest_url: string
          edition_id: string
          edition_number: number
          final_position: number
          is_champion: boolean
          league_id: string
          league_name: string
          participant_count: number
          team_name: string
        }[]
      }
      player_career_summary: {
        Args: { p_user_id: string }
        Returns: {
          assists: number
          draws: number
          editions_played: number
          goals: number
          goals_against: number
          goals_for: number
          losses: number
          played: number
          titles: number
          wins: number
        }[]
      }
      player_next_match: {
        Args: { p_user_id: string }
        Returns: {
          competition_id: string
          competition_name: string
          deadline_at: string
          edition_id: string
          league_id: string
          league_name: string
          match_id: string
          opponent_crest_url: string
          opponent_team_name: string
          round: number
          status: string
          team_name: string
        }[]
      }
      player_recent_form: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          edition_id: string
          goals_against: number
          goals_for: number
          match_id: string
          opponent_team_name: string
          played_at: string
          result: string
          team_name: string
        }[]
      }
      player_titles_by_preset: {
        Args: { p_user_id: string }
        Returns: {
          last_at: string
          preset_id: string
          title_count: number
        }[]
      }
      resolve_contested_match: {
        Args: { p_away_goals: number; p_home_goals: number; p_match_id: string }
        Returns: {
          away_goals: number | null
          away_participant_id: string | null
          confirmed_at: string | null
          created_at: string
          deadline_at: string | null
          edition_id: string
          home_goals: number | null
          home_participant_id: string | null
          id: string
          leg: number
          reported_at: string | null
          reported_by: string | null
          resolved_at: string | null
          resolved_by: string | null
          round: number
          status: string
          wo_winner_participant_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "matches"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_match_report: {
        Args: {
          p_away_goals: number
          p_away_red_cards: number
          p_away_yellow_cards: number
          p_events: Json
          p_home_goals: number
          p_home_red_cards: number
          p_home_yellow_cards: number
          p_match_id: string
          p_screenshot_path: string
        }
        Returns: {
          away_goals: number | null
          away_participant_id: string | null
          confirmed_at: string | null
          created_at: string
          deadline_at: string | null
          edition_id: string
          home_goals: number | null
          home_participant_id: string | null
          id: string
          leg: number
          reported_at: string | null
          reported_by: string | null
          resolved_at: string | null
          resolved_by: string | null
          round: number
          status: string
          wo_winner_participant_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "matches"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
