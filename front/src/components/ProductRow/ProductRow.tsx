import { Button, Popover, TableCell, TableRow } from "@suid/material";
import { createSignal, JSX, Show } from "solid-js";

type ProductRow = {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  deleteP?: (product_id: number) => void;
  changeQuantity?: (id: number, quantity: number) => void;
  onDoubleClick?: (product_id: number) => void;
  contextMenuItems?: JSX.Element;
};

export default function ProductRow({
  name,
  price,
  product_id,
  quantity,
  changeQuantity,
  deleteP,
  onDoubleClick,
  contextMenuItems,
}: ProductRow) {
  function changeProductQuantity(e: { currentTarget: { value: any } }) {
    if (changeQuantity) {
      changeQuantity(product_id, Number(e.currentTarget.value));
    }
  }

  function doubleClickEvent() {
    if (onDoubleClick) {
      onDoubleClick(product_id);
    }
  }

  const [anchorEl, setAnchorEl] = createSignal<HTMLTableRowElement | null>(
    null
  );
  const [popoverCords, setPopoverCords] = createSignal({ x: 0, y: 0 });

  const handleClick = (
    event: MouseEvent & { currentTarget: HTMLTableRowElement }
  ) => {
    event.preventDefault();

    if (Boolean(anchorEl())) {
      setAnchorEl(null);
    } else {
      setPopoverCords({ x: event.clientX, y: event.clientY });
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  function close() {
    if (Boolean(anchorEl())) {
      setAnchorEl(null);
    }
  }

  const open = () => Boolean(anchorEl());
  const id = () => (open() ? "simple-popover" : undefined);

  return (
    <TableRow
      onContextMenu={handleClick}
      aria-describedby={id()}
      sx={{ userSelect: "none" }}
      onDblClick={doubleClickEvent}
    >
      <Popover
        id={id()}
        open={open()}
        anchorEl={anchorEl()}
        onClose={handleClose}
        anchorPosition={{ left: popoverCords().x, top: popoverCords().y }}
        anchorReference="anchorPosition"
      >
        {contextMenuItems}
      </Popover>
      <TableCell align="left">{product_id}</TableCell>
      <TableCell align="left">{name}</TableCell>
      <TableCell align="right">{price || "Немає"}</TableCell>
      <TableCell align="center">{quantity}</TableCell>
    </TableRow>
  );
}
