import $ from 'jquery';

function enableMultipleModals() {
  $(document).on('show.bs.modal', '.modal', function () {
    const zIndex = 1050 + 20 * $('.modal:visible').length;
    $(this).css('z-index', zIndex);
    setTimeout(() =>
      $('.modal-backdrop')
        .not('.modal-stack')
        .css('z-index', zIndex - 10)
        .addClass('modal-stack')
    );
  });

  $(document).on('hidden.bs.modal', '.modal', function () {
    $('.modal:visible').length && $(document.body).addClass('modal-open');
  });
}

export default {
  enableMultipleModals
};
