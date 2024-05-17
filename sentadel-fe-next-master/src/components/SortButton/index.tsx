import { Dropdown, MenuProps } from "antd";
import styles from "@/components/SortButton/styles.module.scss";
import { CSSProperties } from "react";

interface SortDropdownProps {
  label?: string;
  sortData: MenuProps;
  customStyles?: CSSProperties;
  error?: { message: string };
}

const SortDropdown = (props: SortDropdownProps) => {
  const { label, sortData, customStyles, error } = props;

  return (
    <div className={styles.container}>
      {label && <label htmlFor="label">{label}</label>}
      <Dropdown menu={sortData}>
        <div
          className={styles.sortByButton}
          style={customStyles}
          onClick={(e) => console.log(e)}
        >
          <div>Sort By</div>
          <div className={styles.icon}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_3198_18625)">
                <path
                  d="M13.332 14.0013V10.668"
                  stroke="#6D7A96"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M11.332 10.668H15.332"
                  stroke="#6D7A96"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M2.66797 13.9987V9.33203"
                  stroke="#6D7A96"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M0.667969 9.33203H4.66797"
                  stroke="#6D7A96"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M8 14V8"
                  stroke="#6D7A96"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M6 5.33203H10"
                  stroke="#6D7A96"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M13.332 8V2"
                  stroke="#6D7A96"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M8 5.33333V2"
                  stroke="#6D7A96"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M2.66797 6.66667V2"
                  stroke="#6D7A96"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_3198_18625">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
      </Dropdown>
      {error && <div className="err-message">{error.message}</div>}
    </div>
  );
};

export default SortDropdown;
