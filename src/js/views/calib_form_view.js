import Backbone from "backbone";
import _ from "underscore";
import $ from "jquery";

import FigureLutPicker from "../views/lutpicker";
import calib_form_template from '../../templates/calib_form.template.html?raw';
import lutsPng from "../../images/luts_10.png"; // Import the LUT image
const lutsPngUrl = STATIC_DIR + lutsPng;

// Created new for each selection change
var CalibFormView = Backbone.View.extend({

    template: _.template(calib_form_template),

    initialize: function(opts) {
        this.render = _.debounce(this.render);
        this.models = opts.models;

        var self = this;
        this.models.forEach(function(m) {
            self.listenTo(m, 'change:calib change:lutBgPos', self.render);
        });
    },

    events: {
        "submit .calib_form": "update_calib",
        "click .calib_label": "update_calib",
        "change .btn": "dropdown_btn_changed",
        "click .hide_calib": "hide_calib",
        "click .pick_lut": "pickLut", 
    },

    dropdown_btn_changed: function(event) {
        $(event.target).closest('form').submit();
    },

    hide_calib: function() {
        this.models.forEach(function(m) {
            m.hide_calib();
        });
    },

    update_calib: function(event) {
        var $form = $('.calib_form');
        var position = $('.label-position i:first', $form).attr('data-position');

        this.models.forEach(function(m) {
            var lutBgPos = m.get('lutBgPos');
            var cb = { show: true, lutBgPos: lutBgPos };

            if (position != '-') cb.position = position;

            m.save_calib(cb);
        });
        return false;
    },

    pickLut: function(event) {
        // Use the FigureLutPicker to pick a LUT and update the preview
        FigureLutPicker.show({
            success: (pickedLut) => {
                this.updateLutPreview(pickedLut);
            }
        });
    },

    updateLutPreview: function(lutName) {
        var bgPos = FigureLutPicker.getLutBackgroundPosition(lutName);

        this.models.forEach(function(m) {
            m.set('lutBgPos', bgPos);
        });

        // Update the preview in the form
        $(".lutPreview", this.el).css({
            'background-position': bgPos,
            'background-image': `url(${lutsPngUrl})`
        });
    },

    render: function() {
        var json = {show: false},
            hidden = false,
            cb;

        this.models.forEach(function(m) {
            cb = m.get('calib');
            var lutBgPos = m.get('lutBgPos');

            if (cb) {
                if (!json.length) {
                    json.position = cb.position;
                    json.lutBgPos = lutBgPos;
                } else {
                    if (json.position != cb.position) json.position = '-';
                }
            }
            if (!cb || !cb.show) hidden = true;
        });

        if (this.models.length === 0 || hidden) {
            json.show = true;
        }

        json.position = json.position || 'right';
        json.lutImg = lutsPngUrl;

        var html = this.template(json);
        this.$el.html(html);
        return this;
    }
});

export default CalibFormView;
