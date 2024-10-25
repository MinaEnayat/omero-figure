import Backbone from "backbone";
import _ from "underscore";
import $ from "jquery";

import FigureLutPicker from "../views/lutpicker";
import calib_form_template from '../../templates/calib_form.template.html?raw';

// Created new for each selection change
var CalibFormView = Backbone.View.extend({

    template: _.template(calib_form_template),

    initialize: function(opts) {

        // prevent rapid repetitive rendering when listening to multiple panels
        this.render = _.debounce(this.render);

        this.models = opts.models;
        var self = this;

        this.models.forEach(function(m){
            self.listenTo(m, 'change:calib change:lutBgPos', self.render);
        });
    },

    events: {
        "submit .calib_form": "update_calib",
        "click .calib_label": "update_calib",
        "change .btn": "dropdown_btn_changed",
        "click .hide_calib": "hide_calib",
        "click .lutpicker-btn": "pick_lut",  // Event to open the LUT picker
    },

    // Automatically submit the form when a dropdown is changed
    dropdown_btn_changed: function(event) {
        $(event.target).closest('form').submit();
    },

    hide_calib: function() {
        this.models.forEach(function(m){
            m.hide_calib();
        });
    },

    // called when form changes
    update_calib: function(event) {
        var $form = $('.calib_form');
        var position = $('.label-position i:first', $form).attr('data-position');
        

        this.models.forEach(function(m){
            var lutBgPos = m.get('lutBgPos');
            var cb = { show: true, lutBgPos: lutBgPos };

            if (position != '-') cb.position = position;

            m.save_calib(cb);
        });
        return false;
    },

    render: function() {
        var json = {show: false},
            hidden = false,
            cb;

        this.models.forEach(function(m){

            cb = m.get('calib');
            var lutBgPos = m.get('lutBgPos');

            // if panel has calib, combine into json
            if (cb) {
                if (!json.length) {
                    json.position = cb.position;
                    json.lutBgPos = lutBgPos;
                    console.log("Json lutBgPos ",json.lutBgPos);
                } else {
                    if (json.position != cb.position) json.position = '-';
                }
            }
            // if any panels don't have calib - we allow to add
            if(!cb || !cb.show) hidden = true;
        });

        if (this.models.length === 0 || hidden) {
            json.show = true;
        }

        json.position = json.position || 'right';
        console.log("see without model.each", json.lutBgPos);

        var html = this.template(json);
        this.$el.html(html);
        return this;
    }
});

export default CalibFormView;
