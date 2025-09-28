// Entity classes that use the backend API
import { inventoryAPI, recommendationsAPI, intelligenceSignalsAPI } from './api.js';

export class InventoryItem {
  constructor(data) {
    Object.assign(this, data);
    // Map backend field names to frontend expectations
    this.currentStock = data.current_stock || data.currentStock;
    this.current_stock = data.current_stock || data.currentStock;
  }

  static async list() {
    try {
      const items = await inventoryAPI.list();
      return items.map(item => new InventoryItem(item));
    } catch (error) {
      console.error('Failed to fetch inventory items:', error);
      throw error;
    }
  }

  static async get(itemId) {
    try {
      const item = await inventoryAPI.get(itemId);
      return new InventoryItem(item);
    } catch (error) {
      console.error(`Failed to fetch inventory item ${itemId}:`, error);
      throw error;
    }
  }

  static async create(itemData) {
    try {
      const item = await inventoryAPI.create(itemData);
      return new InventoryItem(item);
    } catch (error) {
      console.error('Failed to create inventory item:', error);
      throw error;
    }
  }

  async update(updateData) {
    try {
      const item = await inventoryAPI.update(this.item_id, updateData);
      Object.assign(this, item);
      return this;
    } catch (error) {
      console.error(`Failed to update inventory item ${this.item_id}:`, error);
      throw error;
    }
  }

  async delete() {
    try {
      await inventoryAPI.delete(this.item_id);
      return true;
    } catch (error) {
      console.error(`Failed to delete inventory item ${this.item_id}:`, error);
      throw error;
    }
  }

  static async getLowStock() {
    try {
      const items = await inventoryAPI.getLowStock();
      return items.map(item => new InventoryItem(item));
    } catch (error) {
      console.error('Failed to fetch low stock items:', error);
      throw error;
    }
  }
}

export class Recommendation {
  constructor(data) {
    Object.assign(this, data);
  }

  static async list(filters = {}) {
    try {
      const recommendations = await recommendationsAPI.list(filters);
      return recommendations.map(rec => new Recommendation(rec));
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      throw error;
    }
  }

  static async get(recommendationId) {
    try {
      const recommendation = await recommendationsAPI.get(recommendationId);
      return new Recommendation(recommendation);
    } catch (error) {
      console.error(`Failed to fetch recommendation ${recommendationId}:`, error);
      throw error;
    }
  }

  static async create(recommendationData) {
    try {
      const recommendation = await recommendationsAPI.create(recommendationData);
      return new Recommendation(recommendation);
    } catch (error) {
      console.error('Failed to create recommendation:', error);
      throw error;
    }
  }

  static async getHighPriority() {
    try {
      const recommendations = await recommendationsAPI.getHighPriority();
      return recommendations.map(rec => new Recommendation(rec));
    } catch (error) {
      console.error('Failed to fetch high priority recommendations:', error);
      throw error;
    }
  }
}

export class IntelligenceSignal {
  constructor(data) {
    Object.assign(this, data);
  }

  static async list(filters = {}) {
    try {
      const signals = await intelligenceSignalsAPI.list(filters);
      return signals.map(signal => new IntelligenceSignal(signal));
    } catch (error) {
      console.error('Failed to fetch intelligence signals:', error);
      throw error;
    }
  }

  static async get(signalId) {
    try {
      const signal = await intelligenceSignalsAPI.get(signalId);
      return new IntelligenceSignal(signal);
    } catch (error) {
      console.error(`Failed to fetch intelligence signal ${signalId}:`, error);
      throw error;
    }
  }

  static async create(signalData) {
    try {
      const signal = await intelligenceSignalsAPI.create(signalData);
      return new IntelligenceSignal(signal);
    } catch (error) {
      console.error('Failed to create intelligence signal:', error);
      throw error;
    }
  }
}