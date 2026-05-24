require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { realtime: { transport: ws } }
);

const NOW = () => Math.floor(Date.now() / 1000);

function applyFilter(query, filter) {
  for (const [key, val] of Object.entries(filter)) {
    if (val !== null && typeof val === 'object' && '$ne' in val) {
      query = query.neq(key, val.$ne);
    } else {
      query = query.eq(key, val);
    }
  }
  return query;
}

const db = {
  users: {
    async create(data) {
      const user = {
        created_at: NOW(), email_verified: 0, kyc_submitted: 0,
        verification_status: 'unverified', balance: 0, role: 'user',
        ...data,
      };
      const { data: row, error } = await supabase.from('users').insert(user).select().single();
      if (error) throw error;
      return row;
    },

    async findById(id) {
      const { data } = await supabase.from('users').select('*').eq('id', parseInt(id)).single();
      return data || null;
    },

    async findByEmail(email) {
      const { data } = await supabase.from('users').select('*').eq('email', email).single();
      return data || null;
    },

    async findByToken(token) {
      const { data } = await supabase.from('users').select('*').eq('verification_token', token).single();
      return data || null;
    },

    async update(id, updates) {
      if (updates.$inc) {
        const current = await db.users.findById(id);
        if (!current) return null;
        for (const [k, v] of Object.entries(updates.$inc)) {
          updates[k] = (current[k] || 0) + v;
        }
        delete updates.$inc;
      }
      const { data } = await supabase.from('users').update(updates).eq('id', parseInt(id)).select().single();
      return data || null;
    },

    async findAll(filter = {}) {
      let query = supabase.from('users').select('*').order('created_at', { ascending: false });
      query = applyFilter(query, filter);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async count(filter = {}) {
      let query = supabase.from('users').select('id', { count: 'exact', head: true });
      query = applyFilter(query, filter);
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },

    async delete(id) {
      const { error } = await supabase.from('users').delete().eq('id', parseInt(id));
      if (error) throw error;
    },
  },

  deposits: {
    async create(data) {
      const dep = { status: 'pending', created_at: NOW(), ...data };
      const { data: row, error } = await supabase.from('deposits').insert(dep).select().single();
      if (error) throw error;
      return row;
    },

    async findById(id) {
      const { data } = await supabase.from('deposits').select('*').eq('id', parseInt(id)).single();
      return data || null;
    },

    async findByUser(userId) {
      const { data } = await supabase.from('deposits').select('*').eq('user_id', parseInt(userId)).order('created_at', { ascending: false });
      return data || [];
    },

    async update(id, updates) {
      const { data } = await supabase.from('deposits').update(updates).eq('id', parseInt(id)).select().single();
      return data || null;
    },

    async count(filter = {}) {
      let query = supabase.from('deposits').select('id', { count: 'exact', head: true });
      query = applyFilter(query, filter);
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },

    async findAll(filter = {}) {
      let query = supabase.from('deposits').select('*').order('created_at', { ascending: false });
      query = applyFilter(query, filter);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async deleteByUser(userId) {
      const { error } = await supabase.from('deposits').delete().eq('user_id', parseInt(userId));
      if (error) throw error;
    },
  },

  withdrawals: {
    async create(data) {
      const wd = { status: 'pending', created_at: NOW(), ...data };
      const { data: row, error } = await supabase.from('withdrawals').insert(wd).select().single();
      if (error) throw error;
      return row;
    },

    async findByUser(userId) {
      const { data } = await supabase.from('withdrawals').select('*').eq('user_id', parseInt(userId)).order('created_at', { ascending: false });
      return data || [];
    },

    async update(id, updates) {
      const { data } = await supabase.from('withdrawals').update(updates).eq('id', parseInt(id)).select().single();
      return data || null;
    },

    async count(filter = {}) {
      let query = supabase.from('withdrawals').select('id', { count: 'exact', head: true });
      query = applyFilter(query, filter);
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },

    async findAll(filter = {}) {
      let query = supabase.from('withdrawals').select('*').order('created_at', { ascending: false });
      query = applyFilter(query, filter);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async deleteByUser(userId) {
      const { error } = await supabase.from('withdrawals').delete().eq('user_id', parseInt(userId));
      if (error) throw error;
    },
  },

  investments: {
    async create(data) {
      const inv = { status: 'active', created_at: NOW(), ...data };
      const { data: row, error } = await supabase.from('investments').insert(inv).select().single();
      if (error) throw error;
      return row;
    },

    async findByUser(userId) {
      const { data } = await supabase.from('investments').select('*').eq('user_id', parseInt(userId)).order('created_at', { ascending: false });
      return data || [];
    },

    async deleteByUser(userId) {
      const { error } = await supabase.from('investments').delete().eq('user_id', parseInt(userId));
      if (error) throw error;
    },
  },
};

module.exports = db;
module.exports.supabase = supabase;
