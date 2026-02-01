import { Search, SlidersHorizontal } from "lucide-react";
import AddFile from "./AddFile";
import { motion } from "motion/react";

function CenterPanel({ setRefresh }) {
  return (
    <motion.div className="center-panel-inner-div" layout="position">
      <motion.div className="search-div">
        <motion.div layout className="search-bar">
          <motion.div className="search-icon" layout>
            <Search layout="position" size={16} />
          </motion.div>
          <motion.input
            layout="position"
            className="search-field"
            type="text"
            placeholder="Search files..."
            name="search-field"
            id="search"
          />
        </motion.div>
        <motion.button className="filter-button" layout>
          <SlidersHorizontal size={16} />
          <span>Filters</span>
        </motion.button>
      </motion.div>
      {/* <AddFile setRefresh={setRefresh} /> */}
    </motion.div>
  );
}

export default CenterPanel;
