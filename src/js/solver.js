import {Mat} from "./mat.js";

class Solver {
  constructor() {
    this.decay_rate = 0.999;
    this.smooth_eps = 1e-8;
    this.step_cache = {};
  }
  
  step(model, step_size, regc, clipval) {
    // perform parameter update
    let solver_stats = {};
    let num_clipped = 0;
    let num_tot = 0;
    
    for(let k in model) {
      let m = model[k]; // mat ref
      
      this.step_cache[k] = this.step_cache[k] || new Mat(m.n, m.d); 
      
      let s = this.step_cache[k];
      for(let i=0,n=m.w.length;i<n;i++) {

        // rmsprop adaptive learning rate
        let mdwi = m.dw[i];
        s.w[i] = s.w[i] * this.decay_rate + (1.0 - this.decay_rate) * mdwi * mdwi;

        // gradient clip
        if(mdwi > clipval) {
          mdwi = clipval;
          num_clipped++;
        }
        if(mdwi < -clipval) {
          mdwi = -clipval;
          num_clipped++;
        }
        num_tot++;

        // update (and regularize)
        m.w[i] += - step_size * mdwi / Math.sqrt(s.w[i] + this.smooth_eps) - regc * m.w[i];
        m.dw[i] = 0; // reset gradients for next iteration
      }
    }
    solver_stats['ratio_clipped'] = num_clipped*1.0/num_tot;
    return solver_stats;
  }
}

export default Solver;